
import { compose, createStore, applyMiddleware } from 'redux'
import persistState from './enhancers/localstorage/persistState'
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import dappGrapher, { initialState } from './reducers/root'
import { contractsExcludeKeys } from './reducers/contracts'
import { dappsExcludeKeys } from './reducers/dapps'
import { grapherExcludeKeys } from './reducers/grapher'

const loggerMiddleware = createLogger()

const excludeKeys = [].concat(
  contractsExcludeKeys,
  dappsExcludeKeys,
  grapherExcludeKeys
)

const persistStateConfig = {
  key: 'dapp-grapher',
  excludeKeys: excludeKeys,
}

// persist contracts and grapher
const enhancer = compose(
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  ),
  persistState(['contracts', 'dapps', 'grapher.graphs'], persistStateConfig)
)

export default function configureStore () {
  return createStore(
    dappGrapher,
    initialState,
    enhancer
  )
}
