
import uuid from 'uuid/v4'

import { enqueueContractDeployments, deployEnqueuedContracts } from './contracts'

const ACTIONS = {
  ADD_TEMPLATE: 'DAPPS:ADD_TEMPLATE',
  BEGIN_DEPLOYMENT: 'DAPPS:BEGIN_DEPLOYMENT',
  END_DEPLOYMENT: 'DAPPS:END_DEPLOYMENT',
  DEPLOYMENT_SUCCESS: 'DAPPS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'DAPPS:DEPLOYMENT_FAILURE',
  // TODO
  DELETE_TEMPLATE: 'DAPPS:DELETE_TEMPLATE',
  DELETE_ALL_TEMPLATES: 'DAPPS:DELETE_ALL_TEMPLATES',
  REMOVE_DEPLOYED: 'DAPPS:REMOVE_DEPLOYED',
  ADD_DEPLOYED: 'DAPPS:ADD_DEPLOYED',
  ADD_DEPLOYED_SUCCESS: 'DAPPS:ADD_DEPLOYED_SUCCESS',
  ADD_DEPLOYED_FAILURE: 'DAPPS:ADD_DEPLOYED_FAILURE',
}

const initialState = {
  errors: null,
  ready: true,
  templates: {
    /**
     * uuid: {
     *   template: Template,
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
  getAddTemplateAction as addDappTemplate,
  deployThunk as deployDapp,
  getDeploymentSuccessAction as dappDeploymentSuccess,
  getDeploymentFailureAction as dappDeploymentFailure,
  getEndDeploymentAction as dappDeploymentEnd,
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
          [action.id]: {
            template: action.template,
            deployed: null,
          },
        },
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
    id: uuid(),
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
function deployThunk (displayName, templateId, constructorCalls) {

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

    dispatch(enqueueContractDeployments(constructorCalls))
    dispatch(deployEnqueuedContracts(displayName, templateId))
  }
}
