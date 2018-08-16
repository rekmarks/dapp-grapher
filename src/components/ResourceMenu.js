
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import DeleteIcon from '@material-ui/icons/Delete'
import SubjectIcon from '@material-ui/icons/Subject'

import { contractGraphTypes } from '../graphing/parseContract'

import ContractInstancesList from './ContractInstancesList'

import './style/ResourceMenu.css'

export default class ResourceMenu extends Component {

  // componentDidMount () {
  //   this.setState((prevProps, props) => {

  //   }
  // }

  render () {

    const classes = this.props.classes

    const listHeadingStyle = {
      whiteSpace: 'nowrap',
    }

    const hasNoContractTypes =
      !this.props.contractTypes ||
      Object.keys(this.props.contractTypes).length === 0

    const hasNoContractInstances =
      !this.props.account ||
      !this.props.networkId ||
      !this.props.contractInstances ||
      !this.props.contractInstances.hasOwnProperty(this.props.networkId)

    return (
      <Fragment>
        <div className="ResourceMenu-delete-buttons">
          <List>
            <ListItem button
              disabled={!this.props.selectedGraphId}
              onClick={
                () => this.props.deleteGraph(this.props.selectedGraphId)
              }
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Delete Selected Graph" />
            </ListItem>
            <ListItem button
              disabled={!this.props.hasGraphs}
              onClick={this.props.deleteAllGraphs}
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Delete All Graphs" />
            </ListItem>
          </List>
        </div>
        <Divider />
        <ExpansionPanel
          id="ResourceMenu-contractTypes-panel"
          disabled={hasNoContractTypes}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading} style={listHeadingStyle}>
              Contract Types
            </Typography>
          </ExpansionPanelSummary>
          {hasNoContractTypes ? null : this.getContractTypesJSX()}
        </ExpansionPanel>
        <ExpansionPanel
          id="ResourceMenu-contractInstances-panel"
          disabled={hasNoContractInstances}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading} style={listHeadingStyle}>
              Contract Instances
            </Typography>
          </ExpansionPanelSummary>
          {hasNoContractInstances ? null : this.getContractInstancesJSX()}
        </ExpansionPanel>
      </Fragment>
    )
  }

  /**
   * Gets the JSX representing available contract types for deployment
   * @return {jsx}  a list of available contract types
   */
  getContractTypesJSX = () => {

    const contractTypeNames = Object.keys(this.props.contractTypes)
    contractTypeNames.sort()

    const resourceMenu = this

    const contractTypes = contractTypeNames.map(contractName => {

      const currentGraphId =
        resourceMenu.props.contractTypes[contractName][contractGraphTypes._constructor]

      return (
        <ContracTypeListButton
          key={contractName}
          contractName={contractName}
          graphId={currentGraphId}
          getCreateGraphParams={resourceMenu.props.getCreateGraphParams}
          createGraph={resourceMenu.props.createGraph}
          selectGraph={resourceMenu.props.selectGraph}
          selectedGraphId={resourceMenu.props.selectedGraphId} />
      )
    })

    return (
      <List>
        {contractTypes}
      </List>
    )
  }

  /**
   * Gets the JSX representing deployed contracts (instances) for the current
   * network and account
   * @return {jsx}  TODO
   */
  getContractInstancesJSX = () => {

    const _this = this

    // get all instances for current account and networkId by type
    const instanceTypes = {}
    Object.keys(
      this.props.contractInstances[this.props.networkId]
    ).forEach(address => {

      const instance =
        _this.props.contractInstances[_this.props.networkId][address]

      if (instance.account === _this.props.account) {
        if (instanceTypes[instance.type]) {
          instanceTypes[instance.type][address] = !!instance.truffleInstance
        } else {
          instanceTypes[instance.type] = {
            [address]: !!instance.truffleInstance,
          }
        }
      }
    })

    if (Object.keys(instanceTypes).length === 0) return null // sanity

    const _classes = {
      nested: _this.props.classes.nested,
      root: _this.props.classes.root,
    }

    return (
      <ContractInstancesList
        classes={_classes}
        contractTypes={_this.props.contractTypes}
        instanceTypes={instanceTypes}
        selectContractAddress={_this.props.selectContractAddress}
        addInstance={_this.props.addInstance}
        getCreateGraphParams={_this.props.getCreateGraphParams}
        createGraph={_this.props.createGraph}
        selectGraph={_this.props.selectGraph}
        selectedGraphId={_this.props.selectedGraphId} />
    )
  }
}

ResourceMenu.propTypes = {
  classes: PropTypes.object,
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
  drawerOpen: PropTypes.bool,
}

/* subcomponents */

class ContractInstanceButton extends Component {

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

ContractInstanceButton.propTypes = {
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

class ContracTypeListButton extends Component {

  render () {
    return (
      <ListItem button
        disabled={this.props.selectedGraphId &&
          this.props.selectedGraphId === this.props.graphId}
        onClick={this.onContractTypeClick}
      >
        <ListItemIcon>
          <SubjectIcon />
        </ListItemIcon>
        <ListItemText primary={this.props.contractName} />
      </ListItem>
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

ContracTypeListButton.propTypes = {
  contractName: PropTypes.string,
  createGraph: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  graphId: PropTypes.string,
}
