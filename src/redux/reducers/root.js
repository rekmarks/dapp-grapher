
import { combineReducers } from 'redux'

import contracts, { contractsInitialState } from './contracts'
import dapps, { dappsInitialState } from './dapps'
import grapher, { grapherInitialState } from './grapher'
import renderErrors, { renderErrorsInitialState } from './renderErrors'
import ui, { uiInitialState } from './ui'
import web3, { web3InitialState } from './web3'

const initialState = {
  contracts: {...contractsInitialState},
  dapps: {...dappsInitialState},
  grapher: {...grapherInitialState},
  renderErrors: {...renderErrorsInitialState},
  ui: {...uiInitialState},
  web3: {...web3InitialState},
}

const dappGrapher = combineReducers({
  contracts,
  dapps,
  grapher,
  renderErrors,
  ui,
  web3,
})

export {
  initialState,
}

export default dappGrapher
