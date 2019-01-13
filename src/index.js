
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from './components/App'
import Web3Gatekeeper from './components/Web3Gatekeeper'
import registerServiceWorker from './registerServiceWorker'
import configureStore from './redux/configureStore'

const store = configureStore()

startApp()

function startApp () {

  ReactDOM.render(
    <Provider store={store}>
      <Web3Gatekeeper>
        <App />
      </Web3Gatekeeper>
    </Provider>,
  document.getElementById('root'))

  registerServiceWorker()
}
