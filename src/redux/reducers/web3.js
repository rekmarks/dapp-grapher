
import Web3 from 'web3'

import { setAccountGraph } from './grapher'

const ACTIONS = {
  GET_WEB3: 'WEB3:GET_WEB3',
  GET_WEB3_SUCCESS: 'WEB3:GET_WEB3_SUCCESS',
  GET_WEB3_FAILURE: 'WEB3:GET_WEB3_FAILURE',
  GET_ACCOUNT: 'WEB3:GET_ACCOUNT',
  GET_ACCOUNT_SUCCESS: 'WEB3:GET_ACCOUNT_SUCCESS',
  GET_ACCOUNT_FAILURE: 'WEB3:GET_ACCOUNT_FAILURE',
  CLEAR_ERRORS: 'WEB3:CLEAR_ERRORS',
}

const initialState = {
  account: null,
  injected: null,
  networkId: null,
  provider: null,
  ready: false,
  web3Errors: [],
}

export {
  getWeb3Thunk as getWeb3,
  getClearErrorsAction as clearweb3Errors,
  initialState as web3InitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...state,
        ready: false,
        injected: null,
        networkId: null,
        web3Errors: [],
        account: null,
      }

    case ACTIONS.GET_WEB3_SUCCESS:
      return {
        ...state,
        ready: true,
        injected: action.injectedWeb3,
        provider: action.injectedWeb3.currentProvider,
      }

    case ACTIONS.GET_WEB3_FAILURE:
      return {
        ...state,
        web3Errors: state.web3Errors.concat([action.error]),
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
        networkId: action.networkId,
      }

    case ACTIONS.GET_ACCOUNT_FAILURE:
      return {
        ...state,
        web3Errors: state.web3Errors.concat([action.error]),
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        web3Errors: [],
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

function getAccountSuccessAction (account, networkId) {
  return {
    type: ACTIONS.GET_ACCOUNT_SUCCESS,
    account: account,
    networkId: networkId,
  }
}

function getAccountFailureAction (error) {
  return {
    type: ACTIONS.GET_ACCOUNT_FAILURE,
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

  return async (dispatch, getState) => {

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

    if (web3 &&
      web3.currentProvider.constructor.name === 'MetamaskInpageProvider') {

      dispatch(getWeb3SuccessAction(web3))
      dispatch(getWeb3AccountThunk(web3))
    } else {
      dispatch(getWeb3FailureAction(new Error('invalid web3', web3)))
    }
  }
}

/**
 * [getWeb3AccountThunk description]
 * @param  {[type]} web3 [description]
 * @return {[type]}      [description]
 */
function getWeb3AccountThunk (web3) {

  return async (dispatch, getState) => {

    const state = getState()

    dispatch(getAccountAction())

    if (!state.web3.ready) {
      dispatch(getAccountFailureAction(new Error('web3 not ready')))
      return
    }

    let accounts, networkId
    try {
      accounts = await web3.eth.getAccounts()
      const _networkId = await web3.eth.net.getId()
      networkId = _networkId.toString()
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
    dispatch(getAccountSuccessAction(accounts[0], networkId))
    dispatch(setAccountGraph())
  }
}
