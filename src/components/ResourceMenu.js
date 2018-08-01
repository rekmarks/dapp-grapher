
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Collapse, { Panel } from 'rc-collapse'

import 'rc-collapse/assets/index.css'
import './style/ResourceMenu.css'

export default class ResourceMenu extends Component {

  constructor (props) {
    super(props)
    this.getContractInstancesJSX = this.getContractInstancesJSX.bind(this)
    this.getContractsJSX = this.getContractsJSX.bind(this)
  }

  // componentDidMount () {
  //   this.setState((prevProps, props) => {

  //   }
  // }

  render () {
    return (
      <div className="ResourceMenu" >
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
  getContractsJSX () {

    if (
      !this.props.contractTypes ||
      Object.keys(this.props.contractTypes
    ) === 0) {
      return <p>Please add some contract types.</p>
    }

    const contractTypeNames = Object.keys(this.props.contractTypes)
    contractTypeNames.sort()

    // TODO: alter this so that it calls selectGraphThunk on the id
    // if it exists
    const contracts = []
    contractTypeNames.forEach(contractName => {

      const graphId = this.props.contractTypes[contractName].constructorGraphId

      contracts.push(
        <ContractTypeButton
          key={contractName}
          contractName={contractName}
          graphId={graphId}
          getCreateGraphParams={this.props.getCreateGraphParams}
          createGraph={this.props.createGraph}
          selectGraph={this.props.selectGraph}
          selectedGraph={this.props.selectedGraph} />
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
  getContractInstancesJSX () {

    if (
      !this.props.account ||
      !this.props.networkId ||
      !this.props.contractInstances ||
      !this.props.contractInstances.hasOwnProperty(this.props.networkId)
    ) return

    const instances = []
    Object.keys(
      this.props.contractInstances[this.props.networkId]).forEach(address => {

      const instance =
        this.props.contractInstances[this.props.networkId][address]
      if (instance.account === this.props.account) {

        // instance.type is the same as contractName
        const graphId = this.props.contractTypes[instance.type].deployedGraphId

        instances.push(
          <Collapse key={address + ':collapse'} >
            <Panel
              key={address + ':panel'}
              header={instance.type}
              headerClass="ResourceMenu-panel-inner"
            >
              <p>{address}</p>
              <ContractInstanceButton
                contractName={instance.type}
                graphId={graphId}
                getCreateGraphParams={this.props.getCreateGraphParams}
                createGraph={this.props.createGraph}
                selectGraph={this.props.selectGraph}
                selectedGraph={this.props.selectedGraph} />
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
  networkId: PropTypes.string,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraph: PropTypes.string,
}

/* subcomponents */

class ContractTypeButton extends Component {

  constructor (props) {
    super(props)
    this._onClick = this._onClick.bind(this)
  }

  render () {
    return (
      <button
        className="ResourceMenu-button"
        disabled={this.props.selectedGraph === this.props.graphId}
        onClick={this._onClick}
      >
        {this.props.contractName}
      </button>
    )
  }

  _onClick () {
    if (this.props.graphId) {
      this.props.selectGraph(this.props.graphId)
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        'contract', 'constructor', this.props.contractName))
    }
  }
}

ContractTypeButton.propTypes = {
  contractName: PropTypes.string,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraph: PropTypes.string,
  graphId: PropTypes.string,
}

class ContractInstanceButton extends Component {

  constructor (props) {
    super(props)
    this._onClick = this._onClick.bind(this)
  }

  render () {
    return (
      <button
        className="ResourceMenu-button"
        disabled={this.props.selectedGraph === this.props.graphId}
        onClick={this._onClick}
      >
        Select
      </button>
    )
  }

  _onClick () {
    if (this.props.graphId) {
      this.props.selectGraph(this.props.graphId)
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        'contract', 'deployed', this.props.contractName))
    }
  }
}

ContractInstanceButton.propTypes = {
  contractName: PropTypes.string,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraph: PropTypes.string,
  graphId: PropTypes.string,
}
