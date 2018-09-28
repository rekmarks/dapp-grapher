
import { compose, createStore, applyMiddleware } from 'redux'
import persistState from './enhancers/localstorage/persistState'
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import dappGrapher, { initialState } from './reducers/root'
import { contractsExcludeKeys } from './reducers/contracts'

const loggerMiddleware = createLogger()

const persistStateConfig = {
  key: 'dapp-grapher',
  excludeKeys: [].concat(
    contractsExcludeKeys,
  ),
}

// persist contracts and grapher
const enhancer = compose(
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  ),
  persistState(
    ['contracts', 'dapps.templates', 'grapher.graphs'],
    persistStateConfig
  )
)

export default function configureStore () {
  return createStore(
    dappGrapher,
    initialState,
    enhancer
  )
}
