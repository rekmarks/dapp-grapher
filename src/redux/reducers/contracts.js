
import { contracts as defaultContracts, deploy as _deploy } from 'chain-end'

import { removeGraph } from './grapher'

const ACTIONS = {
  ADD_CONTRACT_TYPE: 'CONTRACTS:ADD_CONTRACT_TYPE',
  ADD_GRAPH_ID: 'CONTRACTS:ADD_GRAPH_ID',
  REMOVE_CONTRACT_TYPE: 'CONTRACTS:REMOVE_CONTRACT_TYPE',
  CLEAR_ERRORS: 'CONTRACTS:CLEAR_ERRORS',
  DEPLOY: 'CONTRACTS:DEPLOY',
  DEPLOYMENT_SUCCESS: 'CONTRACTS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'CONTRACTS:DEPLOYMENT_FAILURE',
  LOG_ERROR: 'CONTRACTS:LOG_ERROR',
}

const contracts = {}
Object.entries(defaultContracts).forEach(([key, value]) => {
  contracts[key] = {
    constructorGraphId: null,
    deployedGraphId: null,
    artifact: value,
  }
})

const initialState = {
  instances: {},
  types: contracts, // TODO: store these by a unique id, not name?
  errors: null,
  ready: true, // TODO: use to prevent deploying while waiting?
}

const excludeKeys = [
  'instance',
  'ready',
  'errors',
]

export {
  addContractTypeThunk as addContractType,
  getAddGraphIdAction as addContractGraphId,
  removeContractTypeThunk as removeContractType,
  deployThunk as deploy,
  getClearErrorsAction as clearerrors,
  excludeKeys as contractsExcludeKeys,
  initialState as contractsInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.ADD_CONTRACT_TYPE:
      return {
        ...state,
        types: {
          ...state.types,
          [action.contractName]: {
            artifact: action.artifact,
            constructorGraphId: null,
            deployedGraphId: null,
          },
        },
      }

    case ACTIONS.ADD_GRAPH_ID:
      return {
        ...state,
        types: {
          ...state.types,
          [action.contractName]: {
            ...state.types[action.contractName],
            ...action.payload,
          },
        },
      }

    case ACTIONS.REMOVE_CONTRACT_TYPE:

      if (!state.contracts.types[action.contractName]) {
        console.warn(ACTIONS.REMOVE_CONTRACT_TYPE + ': type not found')
        return state
      }

      const newState = { ...state }
      delete newState.types[action.contractName]
      return newState

    case ACTIONS.DEPLOY:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.DEPLOYMENT_SUCCESS:
      return {
        ...state,
        instances: {

          ...state.instances,

          [action.data.networkId]: {

            ...state.instances[action.data.networkId],

            [action.data.instance.address]: {

              account: action.data.account,
              type: action.data.contractName,
              constructorParams: action.data.constructorParams,
              instance: action.data.instance,
            },
          },
        },
        ready: true,
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        errors:
          state.errors
          ? state.errors.concat([action.error])
          : [action.error],
        ready: true,
    }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: null,
      }

    case ACTIONS.LOG_ERROR:
      return {
        ...state,
        errors: state.errors
          ? state.errors.concat([action.error])
          : [action.error],
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getAddContractTypeAction (contractName, artifact) {
  return {
    type: ACTIONS.ADD_CONTRACT_TYPE,
    contractName: contractName,
    artifact: artifact,
  }
}

function getAddGraphIdAction (
  contractName,
  params,
) {
  return {
    type: ACTIONS.ADD_GRAPH_ID,
    contractName: contractName,
    payload: {
      ...params,
    },
  }
}

function getRemoveContractTypeAction (contractName) {
  return {
    type: ACTIONS.REMOVE_CONTRACT_TYPE,
    contractName: contractName,
  }
}

function getDeployAction () {
  return {
    type: ACTIONS.DEPLOY,
  }
}

function getDeploymentSuccessAction (payload) {
  return {
    type: ACTIONS.DEPLOYMENT_SUCCESS,
    data: payload,
  }
}

function getDeploymentFailureAction (error) {
  return {
    type: ACTIONS.DEPLOYMENT_FAILURE,
    error: error,
  }
}

function getClearErrorsAction () {
  return {
    type: ACTIONS.CLEAR_ERRORS,
  }
}

function getLogErrorAction (error) {
  return {
    type: ACTIONS.LOG_ERROR,
    error: error,
  }
}

function addContractTypeThunk (contractJSON) {

  return (dispatch, getState) => {

    const state = getState()
    const contractName = contractJSON.contractName

    if (state.contracts.type[contractName]) {
      dispatch(getLogErrorAction(new Error(
        'cannot add duplicate contract type')))
      return
    }

    // validate contractJSON
    if (!contractName) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: missing contract name')))
      return
    }
    if (contractJSON.isDeployed && contractJSON.isDeployed()) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: contract type is deployed instance')))
      return
    }
    if (!contractJSON.abi || !contractJSON.bytecode) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: contract JSON missing bytecode or abi')))
      return
    }

    dispatch(getAddContractTypeAction(contractName, contractJSON))
  }
}

function removeContractTypeThunk (contractName) {

  return (dispatch, getState) => {

    const contract = getState().contracts.types[contractName]

    if (contract) {
      dispatch(removeGraph(contract.constructorGraphId))
      dispatch(removeGraph(contract.deployedGraphId))
      dispatch(getRemoveContractTypeAction(contractName))
    } else {
      dispatch(getLogErrorAction(new Error('contract type not found')))
    }
  }
}

/* Asynchronous action creators */

/**
 * [getDeployThunk description]
 * @param  {[type]} contractName      [description]
 * @param  {[type]} constructorParams [description]
 * @return {[type]}                   [description]
 */
function deployThunk (contractName, constructorParams) {

  return async (dispatch, getState) => {

    dispatch(getDeployAction())

    const state = getState()
    const contractJSON = state.contracts.types[contractName].artifact

    if (!state.web3.provider) {
      dispatch(getDeploymentFailureAction(new Error('missing web3 provider')))
      return
    }
    if (!state.web3.account) {
      dispatch(getDeploymentFailureAction(new Error('missing web3 account')))
      return
    }
    if (!contractJSON) {
      dispatch(getDeploymentFailureAction(new Error(
        'no contract found of type ' + contractName)))
      return
    }

    let instance
    try {
      instance = await _deploy(
        contractJSON,
        constructorParams,
        state.web3.provider,
        state.web3.account
      )
    } catch (error) {
      dispatch(getDeploymentFailureAction(error))
      return
    }

    if (!instance) {
      dispatch(getDeploymentFailureAction(new Error('deployment returned false')))
    }

    const payload = {
      instance: instance,
      account: state.web3.account,
      contractName: contractName,
      constructorParams: constructorParams,
      networkId: state.web3.networkId,
    }
    dispatch(getDeploymentSuccessAction(payload))
  }
}
