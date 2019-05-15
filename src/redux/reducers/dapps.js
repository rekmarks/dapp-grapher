
import uuid from 'uuid/v4'

// reducer imports

import {
  enqueueContractDeployments,
  deployEnqueuedContracts,
} from './contracts'

import { selectDisplayGraph, saveGraph } from './grapher'

import { addSnackbarNotification } from './ui'

// misc imports

import { graphTypes, getDeployedDappGraph } from '../../graphing/graphGenerator'

const ACTIONS = {
  ADD_TEMPLATE: 'DAPPS:ADD_TEMPLATE',
  BEGIN_DEPLOYMENT: 'DAPPS:BEGIN_DEPLOYMENT',
  END_DEPLOYMENT: 'DAPPS:END_DEPLOYMENT',
  DEPLOYMENT_SUCCESS: 'DAPPS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'DAPPS:DEPLOYMENT_FAILURE',
  SELECT_TEMPLATE: 'DAPPS:SELECT_TEMPLATE',
  UPDATE_WIP_DEPLOYMENT: 'DAPPS:UPDATE_WIP_DEPLOYMENT',
  CLEAR_SELECTED_TEMPLATE: 'DAPPS:CLEAR_SELECTED_TEMPLATE',
  SELECT_DEPLOYED: 'DAPPS:SELECT_DEPLOYED',
  // TODO
  ADD_DEPLOYED: 'DAPPS:ADD_DEPLOYED',
  ADD_DEPLOYED_SUCCESS: 'DAPPS:ADD_DEPLOYED_SUCCESS',
  ADD_DEPLOYED_FAILURE: 'DAPPS:ADD_DEPLOYED_FAILURE',
  REMOVE_DEPLOYED: 'DAPPS:REMOVE_DEPLOYED',
  DELETE_TEMPLATE: 'DAPPS:DELETE_TEMPLATE',
  DELETE_ALL_TEMPLATES: 'DAPPS:DELETE_ALL_TEMPLATES',
}

const initialState = {

  // error log
  errors: [],

  // false if a web3-related thunk has yet to complete, preventing further web3
  // calls
  ready: true,

  // the id of the selected dapp template
  selectedTemplateId: null,

  // an object of contract deployments constructed by interacting with the
  // graph of a dapp template
  wipDeployment: null,

  // the selected dapp instance
  selectedDeployedId: null,

  // existing dapp templates per below schema
  templates: {
    /**
     * uuid: {
     *   id: uuid,
     *   dappGraphId: _uuid, // id of the graph describing the template
     *   contractNodes: {}, // the contracts constituting the template
     *   parameterValues: { // graph-defined parameter values
     *     __uuid: {
     *       id: __uuid,
     *       abiType: string,
     *       source: string,
     *     },
     *   },
     *   deployed: { // deployed dapp instances (not the contracts themselves)
     *     uuid: Deployed,
     *   }
     * }
     */
  },
}

export {
  addTemplateThunk as addDappTemplate,
  getSelectTemplateAction as selectDappTemplate,
  getUpdateWipDeploymentAction as updateWipDeployment,
  deployThunk as deployDapp,
  deploymentResultThunk as dappDeploymentResult,
  selectDeployedThunk as selectDeployedDapp,
  getClearSelectedTemplateAction as clearSelectedDappTemplate,
  initialState as dappsInitialState,
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
        selectedDeployedId: null,
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

              [action.payload.id]: {
                id: action.payload.id,
                displayName: action.payload.displayName,
                account: action.payload.account,
                networkId: action.payload.networkId,
                contractInstances: action.payload.contractInstances,
                templateId: action.payload.templateId,
                graphId: action.payload.deployedGraphId,
              },
            },
          },
        },
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
      }

    case ACTIONS.SELECT_DEPLOYED:
      return {
        ...state,
        selectedDeployedId: action.deployedId,
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

function getSelectDeployedAction (deployedId) {
  return {
    type: ACTIONS.SELECT_DEPLOYED,
    deployedId: deployedId,
  }
}

/**
 * Selects the specified deployed dapp instance for display in <Grapher />
 *
 * @param {string} templateId the id of the deployed dapp's template
 * @param {string} deployedId the id of the deployed dapp instance
 */
function selectDeployedThunk (templateId, deployedId) {

  return (dispatch, getState) => {

    const state = getState()

    if (state.dapps.selectedDeployedId !== deployedId) {
      dispatch(getSelectDeployedAction(deployedId))
    }

    const graphId = state.dapps.templates[templateId].deployed[deployedId].graphId
    if (graphId !== state.grapher.displayGraphId) {
      dispatch(selectDisplayGraph(graphId))
    }
  }
}

/**
 * Adds a new template based on the current wipGraph. Fails if there are cyclic
 * dependencies in the wipGraph. Only handles constructor contract nodes for
 * the time being.
 *
 * @param {string} templateName the name of the template; generated if null
 */
function addTemplateThunk (templateName = null) {

  return (dispatch, getState) => {

    const state = getState()

    const wipGraph = state.grapher.wipGraph

    // TODO: throw or log error?
    if (!wipGraph.id) throw new Error('addTemplateThunk: wipGraph has no id')

    dispatch(saveGraph(wipGraph))

    // store contracts in their graph-defined deployment order
    const contracts = getDappGraphDeploymentOrder(wipGraph)

    const nodes = wipGraph.elements.nodes

    // parse graph-defined parameter values
    // when an instance of the dapp is deployed, the values for these
    // parameters are generated automatically
    const parameterValues = {}
    Object.values(wipGraph.elements.edges).forEach(edge => {

      const abiType = nodes[edge.target].abiType

      let source
      if (abiType === 'address') {

        // TODO: this assumes addresses are always contracts, but they could
        // be functions that output addresses
        source = nodes[edge.sourceParent].id
      } else { // TODO: add support for more abi types
        throw new Error('addTemplateThunk: unsupported abiType')
      }

      parameterValues[edge.target] = {
        id: edge.target,
        abiType: abiType,
        source: source,
      }
    })

    dispatch(getAddTemplateAction({
      id: uuid(),
      dappGraphId: wipGraph.id,
      contractNodes: contracts,
      parameterValues: parameterValues,
      displayName: ( // TODO: better name generation if templateName is null?
        templateName ||
        (Object.keys(state.dapps.templates).length + 1).toString()
      ),
      deployed: {},
    }))
  }
}

/**
 * Handles the result of a dapp deployment. On success, saves the deployed
 * instance, generates its graph, and notifies the user. On failure, logs the
 * error and notifies the user.
 *
 * @param {boolean} success true if deployment successful; false otherwise
 * @param {object} resultData deployment result data, from contracts reducer
 */
function deploymentResultThunk (success, resultData) {

  return (dispatch, getState) => {

    const state = getState()

    let deployedId
    if (success) {

      // generate ids for deployed dapp and its corresponding graph
      deployedId = uuid()
      const deployedGraphId = uuid()

      dispatch(addSnackbarNotification(
        resultData.displayName + ' — Dapp deployment successful!',
        6000
      ))
      dispatch(getDeploymentSuccessAction({
        ...resultData,
        id: deployedId,
        deployedGraphId: deployedGraphId,
      }))
      dispatch(saveGraph(getDeployedDappGraph(
        deployedGraphId,
        state.grapher.graphs[
          state.dapps.templates[resultData.templateId].dappGraphId
        ].toJS(),
        Object.values(state.contracts.instances).filter(
          instance => instance.dappTemplateIds.includes(resultData.templateId)
        )
      )))
    } else {
      // log failure
      dispatch(addSnackbarNotification(
        resultData.displayName + ' — Dapp deployment failed. See logs.',
        12000
      ))
      dispatch(getDeploymentFailureAction(resultData.error))
    }

    // indicate that the deployment is over
    dispatch(getEndDeploymentAction())

    // select deployed dapp instance on success
    if (success) {
      dispatch(selectDeployedThunk(
        resultData.templateId,
        deployedId
      ))
    }
  }
}

/**
 * ASYNCHRONOUS ACTION CREATORS
 */

/**
 * Attempts to deploy the contracts of a dapp per wipDeployment.
 * Validates pre-deployment state but not input. May fail in deployment
 * attempt. See contracts reducer.
 *
 * TODO: Validate input?
 *
 * @param {string} displayName the user-facing identifier for the dapp
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
 * Finds contract deployment order from dappgraph by running a hacky topological
 * sort. Throws if graph is cyclic.
 *
 * Implements: https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
 *
 * TODO: This is a band-aid until the graphlib refactor. Understanding this is
 * likely not worth your time.
 *
 * @param {object} dappGraph the graph whose deployment order must be found
 * @return {object} nodes by id with a deployment order property
 */
function getDappGraphDeploymentOrder (dappGraph) {

  const edges = { ...dappGraph.elements.edges }

  const parentNodes = {}
  Object.values(dappGraph.elements.nodes).forEach(node => {

    if (
      Object.values(graphTypes.contract).includes(node.type) ||
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

  const deployments = {}

  // return deploymentOrder, without account node
  deploymentOrder.filter(node => node.id !== 'account').forEach((node, i) => {

    deployments[node.id] = {
      ...node,
      deploymentOrder: i,
      params: {},
    }
  })

  return deployments
}
