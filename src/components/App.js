
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
// import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'

// import ContractForm from './ContractForm'
import Grapher from './Grapher'
import Header from './Header'
import ResourceMenu from './ResourceMenu'

import {
  addContractType,
  addInstance,
  callInstance,
  deploy,
  selectContractAddress,
} from '../redux/reducers/contracts'

import {
  createGraph,
  deleteGraph,
  deleteAllGraphs,
  getCreateGraphParams,
  selectGraph,
} from '../redux/reducers/grapher'

import { logRenderError } from '../redux/reducers/renderErrors'

import {
  closeContractForm,
  openContractForm,
  selectContractFunction,
} from '../redux/reducers/ui'

import { getWeb3 } from '../redux/reducers/web3'

import './style/App.css'

ReactModal.setAppElement('#root')

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
    this.graphContainerRef = React.createRef()
    this.state = {
      graphHeight: null,
      graphWidth: null,
    }
  }

  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and, in the future, re-render with error message
    this.props.logRenderError(error, errorInfo)
  }

  render () {

    const currentGraph = true // TODO: jointjs temp
    // if (this.props.selectedGraphObject) { currentGraph = this.props.selectedGraphObject.toJS() }

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
            <div className="App-ResourceMenu-container" >
              <ResourceMenu
                account={this.props.account}
                addInstance={this.props.addInstance}
                networkId={this.props.networkId}
                contractTypes={this.props.contractTypes}
                contractInstances={this.props.contractInstances}
                createGraph={this.props.createGraph}
                getCreateGraphParams={getCreateGraphParams} // helper, not dispatch
                deleteGraph={this.props.deleteGraph}
                deleteAllGraphs={this.props.deleteAllGraphs}
                selectGraph={this.props.selectGraph}
                selectedGraphId={this.props.selectedGraphId}
                selectContractAddress={this.props.selectContractAddress}
                hasGraphs={this.props.hasGraphs} />
            </div>
            <div className="App-graph-container" ref={this.graphContainerRef} >
              {
                currentGraph
                ? <Grapher
                    graph={currentGraph}
                    openContractForm={this.props.openContractForm}
                    graphContainer={this.graphContainerRef} />
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
              currentGraph
              ? null
              // ? <ContractForm
              //     contractAddress={this.props.selectedContractAddress}
              //     nodes={currentGraph.config.elements.nodes}
              //     contractName={currentGraph.name}
              //     graphType={currentGraph.type}
              //     deploy={this.props.deploy}
              //     callInstance={this.props.callInstance}
              //     closeContractForm={this.props.closeContractForm}
              //     selectContractFunction={this.props.selectContractFunction}
              //     selectedContractFunction={this.props.selectedContractFunction} />
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
  addInstance: PropTypes.func,
  callInstance: PropTypes.func,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  selectedContractAddress: PropTypes.string,
  selectContractAddress: PropTypes.func,
  // grapher
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  selectedGraphObject: PropTypes.object,
  hasGraphs: PropTypes.bool,
  // renderErrors
  logRenderError: PropTypes.func,
  // ui
  contractModal: PropTypes.bool,
  closeContractForm: PropTypes.func,
  openContractForm: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
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
    selectedContractAddress: state.contracts.selectedAddress,
    // grapher
    selectedGraphId: state.grapher.selectedGraphId,
    selectedGraphObject: state.grapher.graphs[state.grapher.selectedGraphId],
    hasGraphs: Object.keys(state.grapher.graphs).length >= 1,
    // ui
    contractModal: state.ui.contractForm.open,
    selectedContractFunction: state.ui.contractForm.selectedFunction,
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
    addInstance: (contractName, address) =>
      dispatch(addInstance(contractName, address)),
    callInstance: (address, functionName, params = null, sender = null) =>
      dispatch(callInstance(address, functionName, params, sender)),
    selectContractAddress: address => dispatch(selectContractAddress(address)),
    // grapher
    createGraph: params => dispatch(createGraph(params)),
    deleteGraph: graphId => dispatch(deleteGraph(graphId)),
    deleteAllGraphs: () => dispatch(deleteAllGraphs()),
    selectGraph: graphId => dispatch(selectGraph(graphId)),
    // renderErrors
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    // ui
    closeContractForm: () => dispatch(closeContractForm()),
    openContractForm: () => dispatch(openContractForm()),
    selectContractFunction: func => dispatch(selectContractFunction(func)),
    // web3
    getWeb3: () => dispatch(getWeb3()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
