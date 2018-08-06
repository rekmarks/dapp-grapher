
import {
  contracts as defaultContracts,
  deploy as _deploy,
  getInstance,
} from 'chain-end'

import { contractGraphTypes as graphTypes } from '../../graphing/contractParser'
import { deleteGraph } from './grapher'

const ACTIONS = {
  ADD_CONTRACT_TYPE: 'CONTRACTS:ADD_CONTRACT_TYPE',
  SET_GRAPH_ID: 'CONTRACTS:SET_GRAPH_ID',
  REMOVE_ALL_GRAPH_IDS: 'CONTRACTS:REMOVE_ALL_GRAPH_IDS',
  REMOVE_CONTRACT_TYPE: 'CONTRACTS:REMOVE_CONTRACT_TYPE',
  CLEAR_ERRORS: 'CONTRACTS:CLEAR_ERRORS',
  DEPLOY: 'CONTRACTS:DEPLOY',
  DEPLOYMENT_SUCCESS: 'CONTRACTS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'CONTRACTS:DEPLOYMENT_FAILURE',
  ADD_INSTANCE: 'CONTRACTS:ADD_INSTANCE',
  ADD_INSTANCE_SUCCESS: 'CONTRACTS:ADD_INSTANCE_SUCCESS',
  ADD_INSTANCE_FAILURE: 'CONTRACTS:ADD_INSTANCE_FAILURE',
  LOG_ERROR: 'CONTRACTS:LOG_ERROR',
}

const contracts = {}
Object.entries(defaultContracts).forEach(([key, value]) => {
  contracts[key] = {
    [graphTypes._constructor]: null,
    [graphTypes.completeAbi]: null,
    [graphTypes.functions]: null,
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
  getSetGraphIdAction as setContractGraphId,
  getRemoveAllGraphIdsAction as removeAllContractGraphIds,
  removeContractTypeThunk as removeContractType,
  deployThunk as deploy,
  addInstanceThunk as addInstance,
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
            [graphTypes._constructor]: null,
            [graphTypes.completeAbi]: null,
            [graphTypes.functions]: null,
          },
        },
      }

    case ACTIONS.SET_GRAPH_ID:
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

    case ACTIONS.REMOVE_ALL_GRAPH_IDS:

      const contractTypes = { ...state.types }
      Object.keys(contractTypes).forEach(contractName => {
        contractTypes[contractName] = {
          artifact: contractTypes[contractName].artifact,
          [graphTypes._constructor]: null,
          [graphTypes.completeAbi]: null,
          [graphTypes.functions]: null,
        }
      })

      return {
        ...state,
        types: { ...contractTypes },
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
      // also adds Truffle instance
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

    case ACTIONS.ADD_INSTANCE:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.ADD_INSTANCE_SUCCESS:

      const newInstances = { ...state.instances }

      if (!newInstances[action.data.networkId]) {
        newInstances[action.data.networkId] = {}
      }

      if (newInstances[action.data.networkId][action.data.instance.address]) {

        newInstances[action.data.networkId][action.data.instance.address] = {
          ...newInstances[action.data.networkId][action.data.instance.address],
          instance: action.data.instance,
        }
      } else {

        newInstances[action.data.networkId][action.data.instance.address] = {
          account: action.data.account,
          instance: action.data.instance,
          type: action.data.contractName,
          constructorParams: null,
        }
      }

      return {
        ...state,
        instances: newInstances,
        ready: true,
      }

    case ACTIONS.ADD_INSTANCE_FAILURE:
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

function getSetGraphIdAction (contractName, params) {
  return {
    type: ACTIONS.SET_GRAPH_ID,
    contractName: contractName,
    payload: {
      ...params,
    },
  }
}

function getRemoveAllGraphIdsAction () {
  return {
    type: ACTIONS.REMOVE_ALL_GRAPH_IDS,
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

function getAddInstanceAction () {
  return {
    type: ACTIONS.ADD_INSTANCE,
  }
}

function getAddInstanceSuccessAction (payload) {
  return {
    type: ACTIONS.ADD_INSTANCE_SUCCESS,
    data: payload,
  }
}

function getAddInstanceFailureAction (error) {
  return {
    type: ACTIONS.ADD_INSTANCE_FAILURE,
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
      dispatch(deleteGraph(contract[graphTypes._constructor]))
      dispatch(deleteGraph(contract[graphTypes.completeAbi]))
      dispatch(deleteGraph(contract[graphTypes.functions]))
      dispatch(getRemoveContractTypeAction(contractName))
    } else {
      dispatch(getLogErrorAction(new Error('contract type not found')))
    }
  }
}

/* Asynchronous action creators */

/**
 * Attempts to deploy the given contract by calling its constructor with the
 * given parameters. Dispatches actions at start and success or failure.
 * 
 * @param  {string} contractName      the name of the contract to deploy
 * @param  {array} constructorParams  the parameters, in the order they must be
 *                                    passed to the constructor
 */
function deployThunk (contractName, constructorParams) {

  return async (dispatch, getState) => {

    const state = getState()
    if (!state.contracts.ready) {
      dispatch(getDeploymentFailureAction(new Error('contracts not ready')))
    }
    if (!state.web3.ready) {
      dispatch(getAddInstanceFailureAction(new Error('web3 not ready')))
    }

    dispatch(getDeployAction())
    
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

/**
 * Attempts to add a deployed contract instance to state.
 * Fails if contract type not yet added, if instance already exists, or if
 * no valid contract is found at the given address on the current network.
 * 
 * @param {[type]} contractName the contract type of the instance
 * @param {[type]} address      the address of the instance
 */
function addInstanceThunk (contractName, address) {

  return async (dispatch, getState) => {

    const state = getState()
    if (!state.contracts.ready) {
      dispatch(getAddInstanceFailureAction(new Error('contracts not ready')))
    }
    if (!state.web3.ready) {
      dispatch(getAddInstanceFailureAction(new Error('web3 not ready')))
    }

    const account = state.web3.account
    const networkId = state.web3.networkId
    const provider = state.web3.provider

    dispatch(getAddInstanceAction())

    let oldInstance
    try {
      oldInstance = state.contracts.instances[networkId][address].instance
    } catch (error) {} // do nothing
    
    if (oldInstance)
      dispatch(getAddInstanceFailureAction(new Error(
        'instance already added'
      )))

    if (!state.contracts.types[contractName])
      dispatch(getAddInstanceFailureAction(new Error(
        'missing contract type'
      )))

    const artifact = state.contracts.types[contractName].artifact

    let instance
    try {
      instance = await getInstance(artifact, provider, address, account)
    } catch (error) {
      dispatch(getAddInstanceFailureAction(error))
      return
    }

    dispatch(getAddInstanceSuccessAction({
      account: account,
      instance: instance,
      networkId: networkId,
      type: contractName,
      // TODO: constructor parameters?
    }))
  }
}
