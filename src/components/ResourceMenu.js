
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Collapse, { Panel } from 'rc-collapse'

import { contractGraphTypes } from '../graphing/parseContract'

import 'rc-collapse/assets/index.css'
import './style/ResourceMenu.css'

export default class ResourceMenu extends Component {

  // componentDidMount () {
  //   this.setState((prevProps, props) => {

  //   }
  // }

  render () {
    return (
      <div className="ResourceMenu" >
        <div className="ResourceMenu-delete-buttons">
          <button
            className="ResourceMenu-button"
            disabled={!this.props.selectedGraphId}
            onClick={() => this.props.deleteGraph(this.props.selectedGraphId)}
          >
            Delete Selected Graph
          </button>
          <button
            className="ResourceMenu-button"
            disabled={!this.props.hasGraphs}
            onClick={this.props.deleteAllGraphs}
          >
            Delete All Graphs
          </button>
        </div>
        <Collapse accordion={true} >
          <Panel
            header="Contract Types"
            headerClass="ResourceMenu-panel-outer"
          >
           {this.getContractsJSX()}
          </Panel>
          {this.getContractInstancesJSX()}
        </Collapse>
      </div>
    )
  }

  /**
   * Gets the JSX representing available contract types for deployment
   * @return {jsx}  one <ContractTypeButton> for every contract type in props
   */
  getContractsJSX = () => {

    if (
      !this.props.contractTypes ||
      Object.keys(this.props.contractTypes
    ) === 0) {
      return <p>Please add some contract types.</p>
    }

    const contractTypeNames = Object.keys(this.props.contractTypes)
    contractTypeNames.sort()

    const thisTarget = this
    const contracts = []
    contractTypeNames.forEach(contractName => {

      const graphId =
        thisTarget.props.contractTypes[contractName][contractGraphTypes._constructor]

      contracts.push(
        <ContractTypeButton
          key={contractName}
          contractName={contractName}
          graphId={graphId}
          getCreateGraphParams={thisTarget.props.getCreateGraphParams}
          createGraph={thisTarget.props.createGraph}
          selectGraph={thisTarget.props.selectGraph}
          selectedGraphId={thisTarget.props.selectedGraphId} />
      )
    })
    return contracts
  }

  /**
   * Gets the JSX representing deployed contracts (instances) for the current
   * network and account
   * @return {jsx}  Panel with one Collapse child for every deployed instance
   *                associated with the account and network id in props
   */
  getContractInstancesJSX = () => {

    if (
      !this.props.account ||
      !this.props.networkId ||
      !this.props.contractInstances ||
      !this.props.contractInstances.hasOwnProperty(this.props.networkId)
    ) return

    const _this = this
    const instances = []
    Object.keys(
      this.props.contractInstances[_this.props.networkId]).forEach(address => {

      const instance =
        _this.props.contractInstances[_this.props.networkId][address]
      if (instance.account === _this.props.account) {

        // instance.type is the same as contractName
        const functionsGraphId =
          _this.props.contractTypes[instance.type][contractGraphTypes.functions]

        instances.push(
          <Collapse key={address + ':collapse'} >
            <Panel
              key={address + ':panel'}
              header={instance.type}
              headerClass="ResourceMenu-panel-inner"
            >
              <p>{address}</p>
              <ContractInstanceButtons
                contractName={instance.type}
                address={address}
                selectContractAddress={this.props.selectContractAddress}
                addInstance={_this.props.addInstance}
                hasInstance={!!instance.truffleInstance}
                functionsGraphId={functionsGraphId}
                getCreateGraphParams={_this.props.getCreateGraphParams}
                createGraph={_this.props.createGraph}
                selectGraph={_this.props.selectGraph}
                selectedGraphId={_this.props.selectedGraphId} />
            </Panel>
          </Collapse>
        )
      }
    })

    return (
      instances.length > 0
      ? <Panel header="Deployed Contracts" headerClass="ResourceMenu-panel-outer">
          {instances}
        </Panel>
      : undefined
    )
  }
}

ResourceMenu.propTypes = {
  account: PropTypes.string,
  addInstance: PropTypes.func,
  networkId: PropTypes.string,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  selectContractAddress: PropTypes.func,
  hasGraphs: PropTypes.bool,
}

/* subcomponents */

class ContractTypeButton extends Component {

  render () {
    return (
      <button
        className="ResourceMenu-button"
        disabled={this.props.selectedGraphId &&
          this.props.selectedGraphId === this.props.graphId}
        onClick={this.onContractTypeClick}
      >
        {this.props.contractName}
      </button>
    )
  }

  onContractTypeClick = () => {
    if (this.props.graphId) {
      this.props.selectGraph(this.props.graphId)
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        'contract', contractGraphTypes._constructor, this.props.contractName))
    }
  }
}

ContractTypeButton.propTypes = {
  contractName: PropTypes.string,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  graphId: PropTypes.string,
}

class ContractInstanceButtons extends Component {

  render () {
    return (
      <div>
        <button
          className="ResourceMenu-button"
          disabled={this.props.selectedGraphId &&
            this.props.selectedGraphId === this.props.functionsGraphId}
          onClick={this.onFunctionsClick}
        >
          Functions
        </button>
      </div>
    )
  }

  onFunctionsClick = () => {
    if (!this.props.hasInstance) {
      this.props.addInstance(this.props.contractName, this.props.address)
    }
    if (this.props.functionsGraphId) {
      this.props.selectGraph(this.props.functionsGraphId)
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
      'contract', contractGraphTypes.functions, this.props.contractName))
    }
    // TODO: unsafe (addInstance could take too long)
    this.props.selectContractAddress(this.props.address)
  }
}

ContractInstanceButtons.propTypes = {
  address: PropTypes.string,
  addInstance: PropTypes.func,
  hasInstance: PropTypes.bool,
  contractName: PropTypes.string,
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  selectContractAddress: PropTypes.func,
  functionsGraphId: PropTypes.string,
}
