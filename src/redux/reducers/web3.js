
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
  account: null, // current selected account from injected web3 object
  networkId: null, // current selected network id from injected web3 object
  provider: null, // current provider from injected web3 object
  ready: false, // false on start or if any thunks have yet to return, true o.w.
  errors: null, // storage for web3 errors
}

export {
  getWeb3Thunk as getWeb3,
  getClearErrorsAction as clearWeb3Errors, // TODO: this is not used, figure out what to do with these errors
  initialState as web3InitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...state,
        ready: false,
        networkId: null,
        errors: null,
        account: null,
      }

    case ACTIONS.GET_WEB3_SUCCESS:
      return {
        ...state,
        ready: true,
        provider: action.injectedWeb3.currentProvider,
      }

    case ACTIONS.GET_WEB3_FAILURE:
      return {
        ...state,
        errors: state.errors
        ? [action.error]
        : state.errors.concat([action.error]),
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
        errors: state.errors
        ? [action.error]
        : state.errors.concat([action.error]),
        ready: true,
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: null,
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
 * Gets the injected web3 object. The first thunk (or action) called on app
 * load.
 */
function getWeb3Thunk () {

  return async (dispatch, getState) => {

    // set state.web3.ready === false
    dispatch(getWeb3Action())

    let web3

    // attempt to get browser-injected web3
    if (typeof window.web3 !== 'undefined') {
      // use MetaMask's provider
      try {
        web3 = await new Web3(window.web3.currentProvider)
      } catch (error) {
        dispatch(getWeb3FailureAction(error))
        return
      }
    } else {
      console.warn('Please install MetaMask.')
      dispatch(getWeb3FailureAction(new Error('No MetaMask found')))
      return
      // TODO: add actual fallback
      // fallback - local node / hosted node + in-dapp id mgmt / fail
      // web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }

    // validate web3 and call next initialization thunk on success
    if (
      web3 &&
      web3.currentProvider.constructor.name === 'MetamaskInpageProvider'
    ) {
      dispatch(getWeb3SuccessAction(web3))
      dispatch(getWeb3AccountThunk(web3))
    } else {
      dispatch(getWeb3FailureAction(new Error('invalid web3', web3)))
    }
  }
}

/**
 * Gets the account from the injected web3 object.
 *
 * @param {object} web3 The injected web3 oject
 */
function getWeb3AccountThunk (web3) {

  return async (dispatch, getState) => {

    const state = getState()

    if (!state.web3.ready) {
      dispatch(getAccountFailureAction(new Error('web3 not ready')))
      return
    }

    // set state.web3.ready === false
    dispatch(getAccountAction())

    // attempt to get account
    let accounts, networkId
    try {
      accounts = await web3.eth.getAccounts()
      const _networkId = await web3.eth.net.getId()
      networkId = _networkId.toString()
    } catch (error) {
      dispatch(getAccountFailureAction(error))
      return
    }

    // fail if account invalid
    if (!accounts || accounts.length < 1) {
      dispatch(getAccountFailureAction(new Error(
        'missing or invalid accounts array', accounts)))
      return
    }

    // since assuming MetaMask, exactly one account should be returned
    if (accounts.length !== 1) console.warn('More than one account found.', accounts)

    // succeed and call next initialization thunk
    dispatch(getAccountSuccessAction(accounts[0], networkId))
    dispatch(setAccountGraph())
  }
}
