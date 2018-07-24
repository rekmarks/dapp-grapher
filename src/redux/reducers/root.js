
import { combineReducers } from 'redux'

import contracts from './contracts'
import grapher from './grapher'
import renderErrors from './renderErrors'
import ui from './ui'
import web3 from './web3'

const dappGrapher = combineReducers({
  contracts,
  grapher,
  renderErrors,
  ui,
  web3,
})

export default dappGrapher
