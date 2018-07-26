
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Collapse, { Panel } from 'rc-collapse'

import 'rc-collapse/assets/index.css'
import './style/ResourceMenu.css'

export default class ResourceMenu extends Component {
  render () {
    return (
      <div className="ResourceMenu" >
        <Collapse accordion={true} >
          <Panel
            header="Contract Types"
            headerClass="ResourceMenu-panel-outer"
          >
           {
            getContractsJSX(this.props.contractTypes)
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
}

/**
 * Gets the JSX representing available contract types for deployment
 * @param  {object} contractTypes contract types
 * @return {jsx}                  a number of <a> elements
 */
function getContractsJSX (contractTypes) {

  if (!contractTypes || Object.keys(contractTypes) === 0) {
    return <p>Please add some contract types.</p>
  }

  const contractTypeNames = Object.keys(contractTypes)
  contractTypeNames.sort()

  const contracts = []
  contractTypeNames.forEach(contractName => {
    contracts.push(
      <a
        className="ResourceMenu-link"
        key={contractName}
        href="#" >
        {contractName}
      </a>
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
