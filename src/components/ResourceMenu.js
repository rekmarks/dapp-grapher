
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Collapse, { Panel } from 'rc-collapse'

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
        <Collapse accordion={true} >
          <Panel
            header="Contract Types"
            headerClass="ResourceMenu-panel-outer"
          >
           {
            getContractsJSX(
              this.props.contractTypes,
              this.props.getCreateGraphParams,
              this.props.createGraph,
              this.props.selectGraph
            )
           }
          </Panel>
          {
            getContractInstancesJSX(
              this.props.account,
              this.props.networkId,
              this.props.contractInstances
            )
          }
        </Collapse>
      </div>
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
}

class ContractTypeButton extends Component {

  constructor (props) {
    super(props)
    this._onClick = this._onClick.bind(this)
  }

  render () {
    return (
      <button
        className="ResourceMenu-button"
        onClick={this._onClick} >
        {this.props.contractName}
      </button>
    )
  }

  _onClick () {
    this.props.onContractTypeClick(
      this.props.contractName,
      this.props.graphId,
      this.props.getCreateGraphParams,
      this.props.createGraph,
      this.props.selectGraph
    )
  }
}

ContractTypeButton.propTypes = {
  contractName: PropTypes.string,
  onContractTypeClick: PropTypes.func,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  graphId: PropTypes.string,
}

function onContractTypeClick (
  contractName,
  graphId,
  getCreateGraphParams,
  createGraph,
  selectGraph
  ) {

  if (graphId) {
    selectGraph(graphId)
  } else {
    createGraph(getCreateGraphParams(
      'contract', 'constructor', contractName))
  }
}

/**
 * Gets the JSX representing available contract types for deployment
 * @param  {object} contractTypes contract types
 * @return {jsx}                  a number of <a> elements
 */
function getContractsJSX (
  contractTypes,
  getCreateGraphParams,
  createGraph,
  selectGraph
  ) {

  if (!contractTypes || Object.keys(contractTypes) === 0) {
    return <p>Please add some contract types.</p>
  }

  const contractTypeNames = Object.keys(contractTypes)
  contractTypeNames.sort()

  // TODO: alter this so that it calls selectGraphThunk on the id
  // if it exists
  const contracts = []
  contractTypeNames.forEach(contractName => {

    const graphId = contractTypes[contractName].constructorGraphId

    contracts.push(
      <ContractTypeButton
        key={contractName}
        contractName={contractName}
        onContractTypeClick={onContractTypeClick}
        graphId={graphId}
        getCreateGraphParams={getCreateGraphParams}
        createGraph={createGraph}
        selectGraph={selectGraph} />
    )
  })
  return contracts
}

/**
 * Gets the JSX representing deployed contracts (instances) for the current
 * network and account
 * @param  {string} account           the current web3 account
 * @param  {string} networkId         the current web3 network id
 * @param  {object} contractInstances contract instances stored in state
 * @return {jsx}                      Panel with Collapse children
 */
function getContractInstancesJSX (account, networkId, contractInstances) {

  if (
    !account ||
    !networkId ||
    !contractInstances ||
    !contractInstances.hasOwnProperty(networkId)
  ) return

  const instances = []
  Object.keys(contractInstances[networkId]).forEach(address => {

    const instance = contractInstances[networkId][address]
    if (instance.account === account) {
      instances.push(
        <Collapse key={address + ':collapse'} >
          <Panel
            key={address + ':panel'}
            header={instance.type}
            headerClass="ResourceMenu-panel-inner"
          >
            <p>Address: {address}</p>
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
