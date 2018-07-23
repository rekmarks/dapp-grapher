
import { compose, createStore, applyMiddleware } from 'redux'
import persistState from './enhancers/localstorage/persistState'
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import dappGrapher from './reducers/root'
import { contractsExcludeKeys } from './reducers/contracts'

const initialState = {}
const loggerMiddleware = createLogger()

const persistStateConfig = {
  key: 'dapp-grapher',
  excludeKeys: contractsExcludeKeys,
}

const enhancer = compose(
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  ),
  persistState('contracts', persistStateConfig)
)

export default function configureStore () {
  return createStore(
    dappGrapher,
    initialState,
    enhancer
  )
}

// export default function configureStore () {
//   return createStore(
//     dappGrapher,
//     initialState,
//     applyMiddleware(
//       thunkMiddleware,
//       loggerMiddleware
//     )
//   )
// }
