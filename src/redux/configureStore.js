
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'

import dappGrapher from './reducer'

const initialState = {}
const loggerMiddleware = createLogger()

export default function configureStore () {
  return createStore(
    dappGrapher,
    initialState,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  )
}
