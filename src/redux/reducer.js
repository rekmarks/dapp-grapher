
import { combineReducers } from 'redux'

import web3Reducer from './web3'

const dappGrapher = combineReducers({
  web3Reducer,
})

export default dappGrapher
