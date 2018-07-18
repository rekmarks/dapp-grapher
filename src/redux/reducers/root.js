
import { combineReducers } from 'redux'

import renderErrors from './renderErrors'
import parser from './parser'
import ui from './ui'
import web3 from './web3'

const dappGrapher = combineReducers({
  parser,
  renderErrors,
  ui,
  web3,
})

export default dappGrapher
