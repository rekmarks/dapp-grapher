
import { combineReducers } from 'redux'

import renderErrors from './renderErrors'
import grapher from './grapher'
import web3 from './web3'

const dappGrapher = combineReducers({
  grapher,
  renderErrors,
  web3,
})

export default dappGrapher
