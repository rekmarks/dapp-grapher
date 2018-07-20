
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import ContractForm from './ContractForm'
import Grapher from './Grapher'
import Header from './Header'
import Home from './Home'
import './style/App.css'

import { logRenderError } from '../redux/reducers/renderErrors'
import { getWeb3, deploy } from '../redux/reducers/web3'

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
  }

  // componentWillReceiveProps (nextProps) {
  //   console.log(nextProps)
  // }

  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.props.logRenderError(error, errorInfo)
  }

  render () {
    // console.log('App render', this.props.web3 && this.props.web3.version)
    return (
      <div className="App">
        <BrowserRouter>
          <div>
            <Header
              web3Injected={!!this.props.web3}
            />
            <div className="App-canvas-container">
              <Switch>
                <Route exact path="/" component={Home} />
                <Route
                  path="/dapp-graph"
                  render={
                    () => <Grapher graph={this.props.graph} /> } />
                <Route
                  path="/contract-form"
                  render={
                    () => <ContractForm
                      nodes={this.props.graph.config.elements.nodes}
                      contractName={this.props.graph.name}
                      deployer={this.props.deployer}
                      deploy={this.props.deploy} /> } />
              </Switch>
            </div>
          </div>
        </BrowserRouter>
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
  graph: PropTypes.object,
  deployer: PropTypes.object,
  deploy: PropTypes.func,
}

function mapStateToProps (state) {
  return {
    // grapher
    graph: state.grapher.selectedGraph,
    // web3
    web3: state.web3.injected,
    deployer: state.web3.deployer,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // renderErrors
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    // web3
    getWeb3: () => dispatch(getWeb3()),
    deploy: (deployer, contractName, constructorParams) =>
      dispatch(deploy(deployer, contractName, constructorParams)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
