import Web3 from 'web3'

const ACTIONS = {
  GET_WEB3: 'WEB3:GET_WEB3',
  GET_WEB3_SUCCESS: 'WEB3:GET_WEB3_SUCCESS',
  GET_WEB3_FAILURE: 'WEB3:GET_WEB3_FAILURE',
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
    default:
      return state
  }
}

function getWeb3 () {

  return async dispatch => {

    dispatch(getWeb3Action())

    // window.addEventListener('load', async () => {

    let web3

    // checking if Web3 has been injected by the browser
    if (typeof window.web3 !== 'undefined') {
      // use MetaMask's provider
      web3 = await new Web3(window.web3.currentProvider)
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      // fallback - local node / hosted node + in-dapp id mgmt / fail
      web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }

    if (web3) {
      dispatch(getWeb3SuccessAction(web3))
    } else {
      dispatch(getWeb3FailureAction('no web3 retrieved'))
    }

    return web3 // to return something
  }
}

export {
  getWeb3,
  ACTIONS,
}
