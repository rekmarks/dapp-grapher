import Web3 from 'web3'
import { Cmd, loop } from 'redux-loop'

const ACTIONS = {
  GET_WEB3: 'WEB3:GET_WEB3',
  GET_WEB3_SUCCESS: 'WEB3:GET_WEB3_SUCCESS',
  GET_WEB3_FAILURE: 'WEB3:GET_WEB3_FAILURE',
}

function getGetWeb3Action () {
  return {
    type: ACTIONS.GET_WEB3,
  }
}

function getWeb3Success (web3) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    web3: web3,
  }
}

function getWeb3Failure (error) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    error: error,
  }
}

const initialState = {
  web3: null,
  ready: false,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return loop(
        {
          ...state,
          ready: false,
          web3: null,
          account: null,
          network: null,
        },
        Cmd.run(getWeb3, {
          successActionCreator: getWeb3Success,
          failureActionCreator: getWeb3Failure,
        })
      )
    case ACTIONS.GET_WEB3_SUCCESS:
      // console.log(state)
      // console.log(action)
      return {
        ...state,
        ready: true,
        web3: action.web3,
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

async function getWeb3 () {

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

    return web3
  // })
}

export {
  getGetWeb3Action,
  ACTIONS,
}
