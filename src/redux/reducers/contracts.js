
import { Deployer } from 'chain-end'

const ACTIONS = {
  INITIALIZE_DEPLOYER: 'CONTRACTS:INITIALIZE_DEPLOYER',
  DEPLOY: 'CONTRACTS:DEPLOY',
  DEPLOYMENT_SUCCESS: 'CONTRACTS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'CONTRACTS:DEPLOYMENT_FAILURE',
  CLEAR_ERRORS: 'CONTRACTS:CLEAR_ERRORS',
}

const initialState = {
  deployer: null,
  instances: {},
  contractErrors: [],
}

const excludeKeys = [
  'deployer',
  'instance',
  'ready',
  'contractErrors',
]

export {
  initializeDeployerThunk as initializeDeployer,
  deployThunk as deploy,
  getClearErrorsAction as clearcontractErrors,
  getInitializeDeployerAction,
  excludeKeys as contractsExcludeKeys,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.INITIALIZE_DEPLOYER:
      return {
        ...state,
        deployer: action.deployer,
      }

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
        contractErrors: state.contractErrors.concat([action.error]),
    }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        contractErrors: [],
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function initializeDeployerThunk () {

  return (dispatch, getState) => {

    const state = getState()

    const deployer = new Deployer(state.web3.provider, state.web3.account)

    dispatch(getInitializeDeployerAction(deployer))
  }
}

function getInitializeDeployerAction (deployer) {
  return {
    type: ACTIONS.INITIALIZE_DEPLOYER,
    deployer: deployer,
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
    const deployer = state.contracts.deployer
    if (!deployer) {
      dispatch(getDeploymentFailureAction(new Error('deployer not initialized')))
      return
    }

    let instance, account
    try {
      account = deployer.config.account
      instance = await deployer.deploy(contractName, constructorParams)
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
