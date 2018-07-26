
import { contracts, deploy as _deploy } from 'chain-end'

const ACTIONS = {
  ADD_CONTRACT_TYPE: 'CONTRACTS:ADD_CONTRACT_TYPE',
  REMOVE_CONTRACT_TYPE: 'CONTRACTS:REMOVE_CONTRACT_TYPE',
  CLEAR_ERRORS: 'CONTRACTS:CLEAR_ERRORS',
  DEPLOY: 'CONTRACTS:DEPLOY',
  DEPLOYMENT_SUCCESS: 'CONTRACTS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'CONTRACTS:DEPLOYMENT_FAILURE',
}

const initialState = {
  instances: {},
  types: contracts,
  contractErrors: null,
}

const excludeKeys = [
  'instance',
  'ready',
  'contractErrors',
]

export {
  addContractTypeThunk as addContractType,
  getRemoveContractTypeAction as removeContractType,
  deployThunk as deploy,
  getClearErrorsAction as clearcontractErrors,
  excludeKeys as contractsExcludeKeys,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.ADD_CONTRACT_TYPE:
      return {
        ...state,
        types: {
          ...state.types,
          [action.contractName]: action.contract,
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
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        contractErrors: 
          state.contractErrors
          ? state.contractErrors.concat([action.error])
          : [action.error]
    }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        contractErrors: null,
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function addContractTypeThunk (contractName) {

  // TODO
  return (dispatch, getState) => {

    const contract = 'sune'

    dispatch(getAddContractTypeAction(contractName, contract))
  }
}

function getAddContractTypeAction (contractName, contract) {
  return {
    type: ACTIONS.ADD_CONTRACT_TYPE,
    contractName: contractName,
    contract: contract,
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
    const provider = state.web3.provider
    const account = state.web3.account
    const contractJSON = state.contracts.types[contractName]

    if (!provider) {
      dispatch(getDeploymentFailureAction(new Error('missing web3 provider')))
      return
    }
    if (!account) {
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
        account
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
      account: account,
      contractName: contractName,
      constructorParams: constructorParams,
      networkId: state.web3.networkId,
    }
    dispatch(getDeploymentSuccessAction(payload))
  }
}
