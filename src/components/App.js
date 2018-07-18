
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Link } from 'react-router-dom'

import ContractForm from './ContractForm'
import Grapher from './Grapher'
import Header from './Header'
import MainMenu from './MainMenu'
import './style/App.css'

import { logRenderError } from '../redux/reducers/renderErrors'
import { setCanvas, canvasComponents } from '../redux/reducers/ui'
import { getWeb3 } from '../redux/reducers/web3'

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
  }

  // componentWillReceiveProps (nextProps) {
  //   debugger
  //   console.log(nextProps)
  // }

  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.props.logRenderError(error, errorInfo)
    // You can also log error messages to an error reporting service here
  }

  render () {
    // console.log('App render', this.props.web3 && this.props.web3.version)
    return (
      <div className="App">
        <Header
          web3Injected={!!this.props.web3}
          setCanvas={this.props.setCanvas}
          canvasComponent={this.props.canvasComponent}
        />
        <div className="App-canvas-container">
          {
            switch (this.props.canvasComponent) {
              case 'Grapher':
                <Grapher />
            }
            this.props.canvasComponent === 'Grapher'
            ? <Grapher />
            : <ContractForm />
          }
        </div>
      </div>
    )
  }
}

App.propTypes = {
  web3: (props, propName, componentName) => {
    if (props[propName] !== null && typeof props[propName] !== 'object') {
      return new Error(
        'Invalid ' + propName + ': Neither null nor an object for component ' + componentName
      )
    }
  },
  getWeb3: PropTypes.func,
  logRenderError: PropTypes.func,
  setCanvas: PropTypes.func,
  canvasComponent: PropTypes.oneOf(canvasComponents),
}

function mapStateToProps (state) {
  // console.log('mapStateToProps', state)
  return {
    web3: state.web3.injected,
    canvasComponent: state.ui.canvasComponent,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    getWeb3: () => dispatch(getWeb3()),
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    setCanvas: (componentName) => dispatch(setCanvas(componentName)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
