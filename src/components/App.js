
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
// import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'

import ContractForm from './ContractForm'
import Grapher from './Grapher'
import Header from './Header'
import ResourceMenu from './ResourceMenu'

import './style/App.css'

import { deploy } from '../redux/reducers/contracts'
import { logRenderError } from '../redux/reducers/renderErrors'
import { closeContractForm, openContractForm } from '../redux/reducers/ui'
import { getWeb3 } from '../redux/reducers/web3'

ReactModal.setAppElement('#root')

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
  }

  // componentWillReceiveProps (nextProps) {
  //   console.log(nextProps)
  // }

  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and, in the future, re-render with error message
    this.props.logRenderError(error, errorInfo)
  }

  render () {
    // console.log('App render', this.props.web3 && this.props.web3.version)
    return (
      <div className="App">
        <div>
          <Header
            web3Injected={!!this.props.web3}
            contractInstances={this.props.contractInstances}
            openContractForm={this.props.openContractForm}
          />
          <ResourceMenu />
          <div className="App-canvas-container">
            <ReactModal
               isOpen={this.props.contractModal}
               contentLabel="contractModal"
               onRequestClose={this.props.closeContractForm}
            >
              <ContractForm
                    nodes={this.props.graph.config.elements.nodes}
                    contractName={this.props.graph.name}
                    deployer={this.props.deployer}
                    deploy={this.props.deploy}
                    closeContractForm={this.props.closeContractForm} />
            </ReactModal>
            <Grapher graph={this.props.graph} />
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  // contracts
  deployer: PropTypes.object,
  deploy: PropTypes.func,
  contractInstances: PropTypes.object,
  // grapher
  graph: PropTypes.object,
  // renderErrors
  logRenderError: PropTypes.func,
  // ui
  contractModal: PropTypes.bool,
  closeContractForm: PropTypes.func,
  openContractForm: PropTypes.func,
  // web3
  getWeb3: PropTypes.func,
  web3: (props, propName, componentName) => {
    if (props[propName] !== null && typeof props[propName] !== 'object') {
      return new Error(
        'Invalid ' + propName + ': Neither null nor an object for component ' + componentName
      )
    }
  },
}

function mapStateToProps (state) {
  return {
    // contracts
    deployer: state.contracts.deployer,
    contractInstances: state.contracts.instances,
    // grapher
    graph: state.grapher.selectedGraph,
    // ui
    contractModal: state.ui.forms.contractForm,
    // web3
    web3: state.web3.injected,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // contracts
    deploy: (deployer, contractName, constructorParams) =>
      dispatch(deploy(deployer, contractName, constructorParams)),
    // renderErrors
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    // ui
    closeContractForm: () => dispatch(closeContractForm()),
    openContractForm: () => dispatch(openContractForm()),
    // web3
    getWeb3: () => dispatch(getWeb3()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
