

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CloudQueueIcon from '@material-ui/icons/CloudQueue'
import SubjectIcon from '@material-ui/icons/Subject'

import NestedList from './ui/NestedList'

import { contractGraphTypes } from '../graphing/parseContract'
import { spacingUnit } from '../withRoot'

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

class ContractsResourceList extends Component {

  handleParentListClick = id => {
    this.setState(state => ({ [id]: !state[id] }))
  }

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
          <ConstructorListButton
            contractName={contractName}
            graphId={currentGraphId}
            getCreateGraphParams={this.props.getCreateGraphParams}
            createGraph={this.props.createGraph}
            selectGraph={this.props.selectGraph}
            selectedGraphId={this.props.selectedGraphId} />
          <NestedList
            icon={(<CloudQueueIcon />)}
            displayText="Instances"
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

  getInstanceListItems = (type, instances) => {

    if (!instances) return null

    return Object.keys(instances).sort().map(address => {

      const functionsGraphId =
          this.props.contractTypes[type][contractGraphTypes.functions]

      return (
        <InstanceListButton
          key={address}
          classes={this.props.classes}
          contractName={type}
          address={address}
          selectContractAddress={this.props.selectContractAddress}
          selectedContractAddress={this.props.selectedContractAddress}
          addInstance={this.props.addInstance}
          hasInstance={instances[address]}
          graphId={functionsGraphId}
          getCreateGraphParams={this.props.getCreateGraphParams}
          createGraph={this.props.createGraph}
          selectGraph={this.props.selectGraph}
          selectedGraphId={this.props.selectedGraphId} />
      )

    })
  }
}

ContractsResourceList.propTypes = {
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
}

export default withStyles(styles)(ContractsResourceList)

/**
 * SUBCOMPONENTS
 */

class ConstructorListButton extends Component {

  render () {
    return (
      <ListItem button
        disabled={
          this.props.selectedGraphId &&
          this.props.selectedGraphId === this.props.graphId
        }
        onClick={this.handleClick}
        style={{ paddingLeft: spacingUnit * 6 }}
      >
        <ListItemIcon>
          <AddCircleOutlineIcon />
        </ListItemIcon>
        <ListItemText primary={this.props.contractName} />
      </ListItem>
    )
  }

  handleClick = () => {
    if (this.props.graphId) {
      this.props.selectGraph(this.props.graphId)
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        contractGraphTypes._constructor,
        { contractName: this.props.contractName }
      ))
    }
  }
}

ConstructorListButton.propTypes = {
  contractName: PropTypes.string,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  graphId: PropTypes.string,
}

class InstanceListButton extends Component {

  render () {

    const { classes } = this.props

    const displayAddress = this.props.address.slice(0, 7) + '...' +
      this.props.address.slice(this.props.address.length - 5)

    return (
      <ListItem button
        className={classes.nested}
        disabled={
          this.props.selectedGraphId &&
          this.props.selectedGraphId === this.props.graphId &&
          !!this.props.selectedContractAddress
          ? this.props.selectedContractAddress === this.props.address
          : false
        }
        onClick={this.handleClick}
      >
        <ListItemText
          inset
          primary={displayAddress}
          primaryTypographyProps={{ noWrap: true }} />
      </ListItem>
    )
  }

  handleClick = () => {
    if (!this.props.hasInstance) {
      this.props.addInstance(this.props.contractName, this.props.address)
    }
    if (this.props.graphId) {

      if (this.props.selectedGraphId !== this.props.graphId) {
        this.props.selectGraph(this.props.graphId)
      }
    } else {
      this.props.createGraph(this.props.getCreateGraphParams(
        contractGraphTypes.functions,
        {contractName: this.props.contractName}
      ))
    }
    // TODO: unsafe (addInstance could take too long)
    this.props.selectContractAddress(this.props.address)
  }
}

InstanceListButton.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
  addInstance: PropTypes.func.isRequired,
  hasInstance: PropTypes.bool.isRequired,
  contractName: PropTypes.string.isRequired,
  createGraph: PropTypes.func.isRequired,
  getCreateGraphParams: PropTypes.func.isRequired,
  selectGraph: PropTypes.func.isRequired,
  selectedGraphId: PropTypes.string,
  selectContractAddress: PropTypes.func.isRequired,
  selectedContractAddress: PropTypes.string,
  graphId: PropTypes.string.isRequired,
}
