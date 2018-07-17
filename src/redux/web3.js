import Web3 from 'web3'

const ACTIONS = {
  GET_WEB3: 'WEB3:GET_WEB3',
  GET_WEB3_SUCCESS: 'WEB3:GET_WEB3_SUCCESS',
  GET_WEB3_FAILURE: 'WEB3:GET_WEB3_FAILURE',
  GET_ACCOUNT: 'WEB3:GET_ACCOUNT',
  GET_ACCOUNT_SUCCESS: 'WEB3:GET_ACCOUNT_SUCCESS',
  GET_ACCOUNT_FAILURE: 'WEB3:GET_ACCOUNT_FAILURE',
}

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

const initialState = {
  ready: false,
  injected: null,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...state,
        ready: false,
        injected: null,
      }
    case ACTIONS.GET_WEB3_SUCCESS:
      // console.log(state)
      // console.log(action)
      return {
        ...state,
        ready: true,
        injected: action.injectedWeb3,
      }
    case ACTIONS.GET_WEB3_FAILURE:
      return {
        ...state,
        ready: false,
        web3Error: action.error,
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
        ready: false,
        web3Error: action.error,
      }
    default:
      return state
  }
}

function getWeb3 () {

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
        return null
      }
    } else {
      console.log('Please install MetaMask.')
      dispatch(getWeb3FailureAction(new Error('No MetaMask found')))
      return null
      // no fallback for now
      // fallback - local node / hosted node + in-dapp id mgmt / fail
      // web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }

    if (web3) {
      dispatch(getWeb3SuccessAction(web3))
      dispatch(getWeb3Account(web3))
    } else {
      dispatch(getWeb3FailureAction(new Error('no web3 retrieved')))
    }

    return web3
  }
}

function getWeb3Account (web3) {

  return async dispatch => {

    dispatch(getAccountAction())

    let accounts
    try {
      accounts = await web3.eth.getAccounts()
    } catch (error) {
      dispatch(getAccountFailureAction(error))
      return null
    }

    if (!accounts || accounts.length < 1) {
      dispatch(getAccountFailureAction(new Error(
        'missing or invalid accounts array', accounts)))
      return null
    }

    if (accounts.length !== 1) console.log('WARNING: More than one account found.', accounts)
    dispatch(getAccountSuccessAction(accounts[0]))
    return accounts[0]
  }
}

export {
  getWeb3,
  getWeb3Account,
  ACTIONS,
}
