
import { setAccountGraph } from './grapher'

const ACTIONS = {
  GET_WEB3: 'WEB3:GET_WEB3',
  GET_WEB3_SUCCESS: 'WEB3:GET_WEB3_SUCCESS',
  GET_WEB3_FAILURE: 'WEB3:GET_WEB3_FAILURE',
  CLEAR_ERRORS: 'WEB3:CLEAR_ERRORS',
}

const initialState = {
  account: null, // current selected account from injected web3 object
  networkId: null, // current selected network id from injected web3 object
  provider: null, // current provider from injected web3 object
  ready: false, // false on start or if any thunks have yet to return, true o.w.
  errors: [], // storage for web3 errors
}

export {
  getWeb3Thunk as getWeb3,
  getClearErrorsAction as clearWeb3Errors, // TODO: these are just stored, figure out what to do with these errors
  initialState as web3InitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...initialState,
      }

    case ACTIONS.GET_WEB3_SUCCESS:
      return {
        ...state,
        ready: true,
        provider: action.provider,
        account: action.account,
        networkId: action.networkId,
      }

    case ACTIONS.GET_WEB3_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
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

function getWeb3SuccessAction (provider, account, networkId) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    provider: provider,
    account: account,
    networkId: networkId,
  }
}

function getWeb3FailureAction (error) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
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
 * Gets the injected web3 object. The first thunk called on app
 * load.
 * Assumes window.ethereum.enable() already called.Does not support legacy
 * dapp browsers.
 * TODO: Add support for other EIP1102-compliant dapp browsers.
 */
function getWeb3Thunk () {

  return async (dispatch, getState) => {

    // set state.web3.ready === false
    dispatch(getWeb3Action())

    let provider, account, networkId

    // attempt to get ethereum object injected by MetaMask
    // TODO: let other dapp browsers through, but add a warning in the UI
    if (window.ethereum && window.ethereum.isMetaMask) {

      try {
        // Request account access if needed
        provider = window.ethereum
        account = window.ethereum.selectedAddress
        networkId = window.ethereum.networkVersion
      } catch (error) {
        // User denied account access...
        dispatch(getWeb3FailureAction(error))
        return
      }
    } else {
      console.warn('Please install MetaMask.')
      dispatch(getWeb3FailureAction(new Error('window.ethereum not found')))
      return
    }

    // fail if account invalid
    if (!account || account.length < 1) {
      dispatch(getWeb3FailureAction(new Error(
        'missing or invalid account', account)))
      return
    }

    dispatch(getWeb3SuccessAction(provider, account, networkId))
    dispatch(setAccountGraph())
  }
}
