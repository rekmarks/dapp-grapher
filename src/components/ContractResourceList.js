
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CloudQueueIcon from '@material-ui/icons/CloudQueue'
import SubjectIcon from '@material-ui/icons/Subject'

import NestedList from './common/NestedList'
import ListButton from './common/ListButton'

import { contractGraphTypes } from '../graphing/graphGenerator'
import { spacingUnit } from '../withMuiRoot'
import { getDisplayAddress } from '../utils'

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 2,
  },
})

class ContractResourceList extends Component {

  render () {

    const contractTypeNames = Object.keys(this.props.contractTypes)
    contractTypeNames.sort()

    return contractTypeNames.map(contractName => {

      const currentGraphId =
        this.props.contractTypes[contractName][contractGraphTypes._constructor]

      return (
        <NestedList
          key={contractName}
          icon={(<SubjectIcon />)}
          displayText={contractName}
          buttonPadding={spacingUnit * 4}
        >
          <ListButton
            disabled={
              this.props.selectedGraphId &&
              this.props.selectedGraphId === currentGraphId
            }
            displayText="Constructor"
            icon={(<AddCircleOutlineIcon />)}
            onClick={
              () => this.handleConstructorClick(currentGraphId, contractName)
            }
            style={{ paddingLeft: spacingUnit * 6 }} />
          <NestedList
            icon={(<CloudQueueIcon />)}
            displayText="Deployed"
            disabled={
              !this.props.instanceTypes ||
              !this.props.instanceTypes[contractName]
            }
            buttonPadding={spacingUnit * 6}
          >
            {
              this.props.instanceTypes
              ? this.getInstanceListItems(
                  contractName,
                  this.props.instanceTypes[contractName]
                )
              : null
            }
          </NestedList>
        </NestedList>
      )
    })
  }

  getInstanceListItems = (contractName, instances) => {

    if (!instances) return null

    return Object.keys(instances).sort().map(address => {

      const graphId =
          this.props.contractTypes[contractName][contractGraphTypes.functions]

      const displayAddress = getDisplayAddress(address)

      const hasInstance = Boolean(instances[address])

      return (
        <ListButton
          key={address}
          disabled={
            this.props.selectedGraphId &&
            this.props.selectedGraphId === graphId &&
            !!this.props.selectedContractAddress
              ? this.props.selectedContractAddress === address
              : false
          }
          displayText={displayAddress}
          inset={true}
          onClick={
            () => this.handleInstanceClick(
              hasInstance,
              graphId,
              contractName,
              address
            )
          }
          primaryTypographyProps={{ noWrap: true }} />
      )
    })
  }

  handleConstructorClick = (graphId, contractName) => {
    if (graphId) {
      this.props.selectGraph(graphId)
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        contractGraphTypes._constructor,
        { contractName: contractName }
      ))
    }
  }

  handleInstanceClick = (hasInstance, graphId, contractName, address) => {
    if (!hasInstance) {
      this.props.addInstance(contractName, address)
    }
    if (graphId) {

      if (this.props.selectedGraphId !== graphId) {
        this.props.selectGraph(graphId)
      }
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        contractGraphTypes.functions,
        {contractName: contractName}
      ))
    }
    // TODO: unsafe (addInstance could take too long)
    this.props.selectContractAddress(address)
  }
}

ContractResourceList.propTypes = {
  classes: PropTypes.object.isRequired,
  contractTypes: PropTypes.object,
  instanceTypes: PropTypes.object,
  selectContractAddress: PropTypes.func,
  selectedContractAddress: PropTypes.string,
  addInstance: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  createGraph: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  grapherMode: PropTypes.string,
}

export default withStyles(styles)(ContractResourceList)
