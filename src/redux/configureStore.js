
import { createStore } from 'redux'
import { install } from 'redux-loop'
import dappGrapher from './reducer'

const initialState = {}

export default function configureStore () {
  return createStore(dappGrapher, initialState, install())
}
