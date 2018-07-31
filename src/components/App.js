
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

import { addContractType, deploy } from '../redux/reducers/contracts'
import {
  createGraph,
  getCreateGraphParams,
  selectGraph,
} from '../redux/reducers/grapher'
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
    return (
      <div className="App">
        <div className="App-rows" >
          <div className="App-top-row" >
            <Header
              web3Injected={!!this.props.web3}
              contractInstances={this.props.contractInstances}
            />
          </div>
          <div className="App-bottom-row" >
            <div className="App-resourceMenu-container" >
              <ResourceMenu
              account={this.props.account}
              networkId={this.props.networkId}
              contractTypes={this.props.contractTypes}
              contractInstances={this.props.contractInstances}
              createGraph={this.props.createGraph}
              getCreateGraphParams={getCreateGraphParams} // helper, not dispatch
              selectGraph={this.props.selectGraph} />
            </div>
            <div className="App-graph-container" >
              {
                this.props.graph
                ? <Grapher
                    graph={this.props.graph}
                    openContractForm={this.props.openContractForm} />
                : <h2 className="App-no-graph-label">Please select a graph</h2>
              }
            </div>
          </div>
        </div>
        <div className="App-modal-container" >
          <ReactModal
            isOpen={this.props.contractModal}
            contentLabel="contractModal"
            onRequestClose={this.props.closeContractForm}
            overlayClassName="App-modal-overlay"
            className="App-modal-content"
          >
            {
              this.props.graph
              ? <ContractForm
                  nodes={this.props.graph.config.elements.nodes}
                  contractName={this.props.graph.name}
                  deploy={this.props.deploy}
                  closeContractForm={this.props.closeContractForm} />
              : null
            }
          </ReactModal>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  // contracts
  addContractType: PropTypes.func,
  deploy: PropTypes.func,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  // grapher
  graph: PropTypes.object,
  createGraph: PropTypes.func,
  selectGraph: PropTypes.func,
  // renderErrors
  logRenderError: PropTypes.func,
  // ui
  contractModal: PropTypes.bool,
  closeContractForm: PropTypes.func,
  openContractForm: PropTypes.func,
  // web3
  account: PropTypes.string,
  networkId: PropTypes.string,
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
    contractInstances: state.contracts.instances,
    contractTypes: state.contracts.types,
    // grapher
    graph: state.grapher.graphs[state.grapher.selectedGraph],
    // ui
    contractModal: state.ui.forms.contractForm,
    // web3
    account: state.web3.account,
    networkId: state.web3.networkId,
    web3: state.web3.injected,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // contracts // TODO: where add contract type?
    addContractType: contractJSON => dispatch(addContractType(contractJSON)),
    deploy: (contractName, constructorParams) =>
      dispatch(deploy(contractName, constructorParams)),
    // grapher
    createGraph: params => dispatch(createGraph(params)),
    selectGraph: graphId => dispatch(selectGraph(graphId)),
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
