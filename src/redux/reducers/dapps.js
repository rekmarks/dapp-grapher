
import uuid from 'uuid/v4'

import { enqueueContractDeployments, deployEnqueuedContracts } from './contracts'

import { contractGraphTypes } from '../../graphing/graphGenerator'
// import { deleteGraph } from './grapher'

const ACTIONS = {
  ADD_TEMPLATE: 'DAPPS:ADD_TEMPLATE',
  BEGIN_DEPLOYMENT: 'DAPPS:BEGIN_DEPLOYMENT',
  END_DEPLOYMENT: 'DAPPS:END_DEPLOYMENT',
  DEPLOYMENT_SUCCESS: 'DAPPS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'DAPPS:DEPLOYMENT_FAILURE',
  SELECT_TEMPLATE: 'DAPPS:SELECT_TEMPLATE',
  UPDATE_WIP_DEPLOYMENT: 'DAPPS:UPDATE_WIP_DEPLOYMENT',
  CLEAR_SELECTED_TEMPLATE: 'DAPPS:CLEAR_SELECTED_TEMPLATE',
  // TODO
  ADD_DEPLOYED: 'DAPPS:ADD_DEPLOYED',
  ADD_DEPLOYED_SUCCESS: 'DAPPS:ADD_DEPLOYED_SUCCESS',
  ADD_DEPLOYED_FAILURE: 'DAPPS:ADD_DEPLOYED_FAILURE',
  SELECT_DEPLOYED: 'DAPPS:SELECT_DEPLOYED',
  REMOVE_DEPLOYED: 'DAPPS:REMOVE_DEPLOYED',
  DELETE_TEMPLATE: 'DAPPS:DELETE_TEMPLATE',
  DELETE_ALL_TEMPLATES: 'DAPPS:DELETE_ALL_TEMPLATES',
}

const initialState = {
  errors: null,
  ready: true,
  selectedTemplateId: null,
  wipDeployment: null,
  selectedDeployedId: null, // actions todo
  templates: {
    /**
     * uuid: {
     *   dappGraphId: _uuid,
     *   deploymentOrder: [],
     *   parameterValues: {
     *     __uuid: {
     *       id: __uuid,
     *       abiType: string,
     *       source: string,
     *     },
     *   },
     *   deployed: {
     *     uuid: Deployed,
     *   }
     * }
     */
  },
}

const excludeKeys = [
  'errors',
  'ready',
]

export {
  addTemplateThunk as addDappTemplate,
  getSelectTemplateAction as selectDappTemplate,
  getUpdateWipDeploymentAction as updateWipDeployment,
  deployThunk as deployDapp,
  deploymentResultThunk as dappDeploymentResult,
  initialState as dappsInitialState,
  excludeKeys as dappsExcludeKeys,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.ADD_TEMPLATE:
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.id]: action.template,
        },
      }

    case ACTIONS.SELECT_TEMPLATE:
      return {
        ...state,
        selectedTemplateId: action.templateId,
      }

    case ACTIONS.UPDATE_WIP_DEPLOYMENT:
      return {
        ...state,
        wipDeployment: action.wipDeployment,
      }

    case ACTIONS.CLEAR_SELECTED_TEMPLATE:
      return {
        ...state,
        selectedTemplateId: null,
        wipDeployment: null,
      }

    case ACTIONS.BEGIN_DEPLOYMENT:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.END_DEPLOYMENT:
      return {
        ...state,
        ready: true,
      }

    case ACTIONS.DEPLOYMENT_SUCCESS:
      return {

        ...state,

        templates: {
          ...state.templates,

          [action.payload.templateId]: {
            ...state.templates[action.payload.templateId],

            deployed: {
              ...state.templates[action.payload.templateId].deployed,

              [action.payload.deployedId]: {
                displayName: action.payload.displayName,
                account: action.payload.account,
                networkId: action.payload.networkId,
                contractInstances: action.payload.contractInstances,
              },
            },
          },
        },
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        errors:
          state.errors
          ? state.errors.concat([action.error])
          : [action.error],
      }

    default:
      return state
  }
}

/**
 * SYNCHRONOUS ACTION CREATORS
 */

function getAddTemplateAction (template) {
  return {
    type: ACTIONS.ADD_TEMPLATE,
    template: template,
    id: template.id,
  }
}

function getSelectTemplateAction (templateId) {
  return {
    type: ACTIONS.SELECT_TEMPLATE,
    templateId: templateId,
  }
}

function getUpdateWipDeploymentAction (wipDeployment) {
  return {
    type: ACTIONS.UPDATE_WIP_DEPLOYMENT,
    wipDeployment: wipDeployment,
  }
}

function getClearSelectedTemplateAction () {
  return {
    type: ACTIONS.CLEAR_SELECTED_TEMPLATE,
  }
}

function getBeginDeploymentAction () {
  return {
    type: ACTIONS.BEGIN_DEPLOYMENT,
  }
}

function getEndDeploymentAction () {
  return {
    type: ACTIONS.END_DEPLOYMENT,
  }
}

function getDeploymentSuccessAction (payload) {
  return {
    type: ACTIONS.DEPLOYMENT_SUCCESS,
    payload: payload,
  }
}

function getDeploymentFailureAction (error) {
  return {
    type: ACTIONS.DEPLOYMENT_FAILURE,
    error: error,
  }
}

/**
 * Only handles constructor contract nodes as of now.
 *
 * @param {[type]} graphId   [description]
 * @param {[type]} dappGraph [description]
 */
function addTemplateThunk (graphId, dappGraph, templateName = null) {

  return (dispatch, getState) => {

    const deploymentOrder = getDappGraphDeploymentOrder(dappGraph)

    const nodes = dappGraph.elements.nodes

    const parameterValues = {}
    Object.values(dappGraph.elements.edges).forEach(edge => {

      const abiType = nodes[edge.target].abiType

      let source
      if (abiType === 'address') {
        source = nodes[edge.sourceParent].id
      } else {
        source = nodes[edge.sourceNode].id
      }

      parameterValues[edge.target] = {
        id: edge.target,
        abiType: abiType,
        source: source,
      }
    })

    dispatch(getAddTemplateAction({
      id: uuid(),
      dappGraphId: graphId,
      deploymentOrder: deploymentOrder,
      parameterValues: parameterValues,
      name: (
        templateName || (Object.keys(getState().dapps.templates).length + 1).toString()
      ),
      deployed: {},
    }))
  }
}

function deploymentResultThunk (success, data) {

  return (dispatch, getState) => {

    dispatch(getClearSelectedTemplateAction())

    if (success) dispatch(getDeploymentSuccessAction(data))
    else dispatch(getDeploymentFailureAction(data))

    dispatch(getEndDeploymentAction())
  }
}

/**
 * ASYNCHRONOUS ACITON CREATORS
 */

/**
 * Attempts to deploy the contracts of a dapp in the order of constructorCalls.
 * Validates pre-deployment state but not input. May fail in deployment
 * attempt. See contracts reducer.
 *
 * TODO: Validate input?
 *
 * @param  {string} displayName      the user-facing identifier for the dapp
 * @param  {string} templateId       the id of the template used
 * @param  {array}  constructorCalls [description]
 */
function deployThunk (displayName) {

  return (dispatch, getState) => {

    const state = getState()
    if (!state.web3.ready) {
      dispatch(getDeploymentFailureAction(new Error('web3 not ready')))
      return
    }
    if (!state.contracts.ready) {
      dispatch(getDeploymentFailureAction(new Error('contracts not ready')))
      return
    }
    if (!state.dapps.ready) {
      dispatch(getDeploymentFailureAction(new Error('dapps not ready')))
    }

    dispatch(getBeginDeploymentAction())

    // TODO: input validation?
    // const template = state.dapps.templates[templateId].template

    dispatch(enqueueContractDeployments(state.dapps.wipDeployment))
    dispatch(deployEnqueuedContracts(displayName, state.dapps.selectedTemplateId))
  }
}

/**
 * HELPERS
 */

/**
 * Finds contract deployment order from dappgraph by running topological
 * sort. Throws if graph is cyclic.
 *
 * Implements: https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
 *
 * @param  {object} dappGraph the graph whose deployment order must be found
 * @return {array}            an array of contract nodes in order of deployment
 */
function getDappGraphDeploymentOrder (dappGraph) {

  const edges = { ...dappGraph.elements.edges }

  const parentNodes = {}
  Object.values(dappGraph.elements.nodes).forEach(node => {

    if (
      Object.values(contractGraphTypes).includes(node.type) ||
      node.id === 'account'
    ) {
      parentNodes[node.id] = { ...node }
    }
  })

  const deploymentOrder = []
  const noIncomingEdges = []
  Object.values(parentNodes).forEach(parentNode => {

    let noIncoming = true

    Object.values(edges).forEach(edge => {
      if (edge.targetParent === parentNode.id) noIncoming = false
    })

    if (noIncoming) {
      noIncomingEdges.push(parentNode)
      delete parentNodes[parentNode.id]
    }
  })

  if (noIncomingEdges.length === 0) throw new Error('cyclic dependencies')

  while (noIncomingEdges.length !== 0) {

    const sourceNode = noIncomingEdges.shift()
    deploymentOrder.push(sourceNode)

    Object.values(parentNodes).forEach(targetNode => {

      Object.values(edges).forEach(edge => {

        if (
          edge.sourceParent === sourceNode.id &&
          edge.targetParent === targetNode.id
        ) delete edges[edge.id]
      })

      let noMoreIncoming = true
      for (const edge of Object.values(edges)) {
        if (edge.targetParent === targetNode.id) {
          noMoreIncoming = false
          break
        }
      }
      if (noMoreIncoming) {
        deploymentOrder.push(targetNode)
        delete parentNodes[targetNode.id]
      }
    })
  }

  if (Object.keys(edges).length !== 0) throw new Error('cyclic dependencies')

  // return deploymentOrder, without account node
  return deploymentOrder.filter(node => node.id !== 'account')
}
