import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './redux/configureStore'

import App from './components/App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const store = configureStore()

startApp()

function startApp () {

  ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'))

  registerServiceWorker()
}
