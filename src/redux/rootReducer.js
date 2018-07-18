
import { combineReducers } from 'redux'

import web3 from './web3'
import parser from './parser'

const dappGrapher = combineReducers({
  web3,
  parser,
})

export default dappGrapher
