
import Web3 from 'web3'

import { Deployer } from 'chain-end'

const ACTIONS = {
  GET_WEB3: 'WEB3:GET_WEB3',
  GET_WEB3_SUCCESS: 'WEB3:GET_WEB3_SUCCESS',
  GET_WEB3_FAILURE: 'WEB3:GET_WEB3_FAILURE',
  GET_ACCOUNT: 'WEB3:GET_ACCOUNT',
  GET_ACCOUNT_SUCCESS: 'WEB3:GET_ACCOUNT_SUCCESS',
  GET_ACCOUNT_FAILURE: 'WEB3:GET_ACCOUNT_FAILURE',
  INITIALIZE_DEPLOYER: 'WEB3:INITIALIZE_DEPLOYER',
  DEPLOY: 'WEB3:DEPLOY',
  DEPLOYMENT_SUCCESS: 'WEB3:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'WEB3:DEPLOYMENT_FAILURE',
  CLEAR_ERRORS: 'WEB3:CLEAR_ERRORS',
}

const initialState = {
  account: null,
  deployer: null,
  injected: null,
  provider: null,
  ready: false,
  web3Error: [],
}

export {
  getWeb3Thunk as getWeb3,
  getDeployThunk as deploy,
  getClearErrorsAction as clearWeb3Errors,
  ACTIONS,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...state,
        ready: false,
        injected: null,
        web3Error: [],
        account: null,
      }

    case ACTIONS.GET_WEB3_SUCCESS:
      return {
        ...state,
        ready: true,
        injected: action.injectedWeb3,
        provider: action.injectedWeb3.currentProvider
      }

    case ACTIONS.GET_WEB3_FAILURE:
      return {
        ...state,
        web3Error: state.web3Error.concat([action.error]),
      }

    case ACTIONS.GET_ACCOUNT:
      return {
        ...state,
        ready: false,
        account: null,
      }

    case ACTIONS.GET_ACCOUNT_SUCCESS:
      return {
        ...state,
        ready: true,
        account: action.account,
      }

    case ACTIONS.GET_ACCOUNT_FAILURE:
      return {
        ...state,
        web3Error: state.web3Error.concat([action.error]),
      }

    case ACTIONS.INITIALIZE_DEPLOYER:
      return {
        ...state,
        deployer: new Deployer(state.provider, state.account),
      }

    case ACTIONS.DEPLOY:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.DEPLOYMENT_SUCCESS:
      return {
        ...state,
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        web3Error: state.web3Error.concat([action.error]),
    }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        web3Error: [],
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getWeb3Action () {
  return {
    type: ACTIONS.GET_WEB3,
  }
}

function getWeb3SuccessAction (web3) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    injectedWeb3: web3,
  }
}

function getWeb3FailureAction (error) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    error: error,
  }
}

function getAccountAction () {
  return {
    type: ACTIONS.GET_ACCOUNT,
  }
}

function getAccountSuccessAction (account) {
  return {
    type: ACTIONS.GET_ACCOUNT_SUCCESS,
    account: account,
  }
}

function getAccountFailureAction (error) {
  return {
    type: ACTIONS.GET_ACCOUNT_FAILURE,
    error: error,
  }
}

function getInitializeDeployerAction () {
  return {
    type: ACTIONS.INITIALIZE_DEPLOYER,
  }
}

function getDeployAction () {
  return {
    type: ACTIONS.DEPLOY,
  }
}

function getDeploymentSuccessAction () {
  return {
    type: ACTIONS.DEPLOYMENT_SUCCESS,
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
 * [getWeb3Thunk description]
 * @return {[type]} [description]
 */
function getWeb3Thunk () {

  return async dispatch => {

    dispatch(getWeb3Action())

    let web3

    // checking if Web3 has been injected by the browser
    if (typeof window.web3 !== 'undefined') {
      // use MetaMask's provider
      try {
        web3 = await new Web3(window.web3.currentProvider)
      } catch (error) {
        dispatch(getWeb3FailureAction(error))
        return
      }
    } else {
      console.log('Please install MetaMask.')
      dispatch(getWeb3FailureAction(new Error('No MetaMask found')))
      return
      // TODO: what's the fallback?
      // fallback - local node / hosted node + in-dapp id mgmt / fail
      // web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }

    if (web3 
      && web3.currentProvider.constructor.name === 'MetamaskInpageProvider') {
      dispatch(getWeb3SuccessAction(web3))
      dispatch(getWeb3AccountThunk(web3))
    } else {
      dispatch(getWeb3FailureAction(new Error('no web3 retrieved')))
    }
  }
}

/**
 * [getWeb3AccountThunk description]
 * @param  {[type]} web3 [description]
 * @return {[type]}      [description]
 */
function getWeb3AccountThunk (web3) {

  return async dispatch => {

    dispatch(getAccountAction())

    let accounts
    try {
      accounts = await web3.eth.getAccounts()
    } catch (error) {
      dispatch(getAccountFailureAction(error))
      return
    }

    if (!accounts || accounts.length < 1) {
      dispatch(getAccountFailureAction(new Error(
        'missing or invalid accounts array', accounts)))
      return
    }

    if (accounts.length !== 1) console.log('WARNING: More than one account found.', accounts)
    dispatch(getAccountSuccessAction(accounts[0]))
    dispatch(getInitializeDeployerAction())
    // dispatch(getDeployThunk(
    //   'StandardERC20', [
    //     'BlackPhillipBux',
    //     'BPX',
    //     18,
    //     666,
    //   ]))
  }
}

/**
 * [getDeployThunk description]
 * @param  {[type]} contractName      [description]
 * @param  {[type]} constructorParams [description]
 * @return {[type]}                   [description]
 */
function getDeployThunk (contractName, constructorParams) {

  return async (dispatch, getState) => {

    dispatch(getDeployAction)

    const deployer = getState().web3.deployer
    if (!deployer) {
      dispatch(getDeploymentFailureAction(new Error('deployer not initialized')))
      return
    }

    let instance
    try {
      instance = await deployer.deploy(contractName, constructorParams)
    } catch (error) {
      dispatch(getDeploymentFailureAction(error))
      return
    }

    if (!instance) {
      dispatch(getDeploymentFailureAction(new Error('deployment returned false')))
    }

    dispatch(getDeploymentSuccessAction())
    console.log('instance', instance)
    return instance
  }
}
