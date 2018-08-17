
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
// import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'

import DeleteIcon from '@material-ui/icons/Delete'
import GetAppIcon from '@material-ui/icons/GetApp'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import SubjectIcon from '@material-ui/icons/Subject'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import BuildIcon from '@material-ui/icons/Build'

import { contractGraphTypes } from '../graphing/parseContract'

import ContractInstancesList from './ContractInstancesList'

export default class ResourceMenu extends Component {

  constructor (props) {

    super(props)
    this.state = {
      storageHref: getStorageHref(),
      contractsList: false,
      contractInstancesList: false,
      devActionsList: false,
      web3InfoList: false,
    }
  }

  componentDidUpdate (prevProps) {

    if (prevProps.contractInstances !== this.props.contractInstances) {
      this.setState({ storageHref: getStorageHref()})
    }
  }

  handleParentListClick = id => {
    this.setState(state => ({ [id]: !state[id] }))
  }

  render () {

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
        <div className="ResourceMenu-dev-buttons">
          <List disablePadding>
            <div id="ResourceMenu-devActionsList">
              {
                this.getNestedList(
                  'devActionsList',
                  (<BuildIcon />),
                  'Dev',
                  [
                    this.getListButton(
                      !this.props.selectedGraphId,
                      () => this.props.deleteGraph(this.props.selectedGraphId),
                      (<DeleteIcon />),
                      'Delete Selected Graph'
                    ),
                    this.getListButton(
                      !this.props.hasGraphs,
                      this.props.deleteAllGraphs,
                      (<DeleteIcon />),
                      'Delete All Graphs'
                    ),
                  ]
                )
              }
            </div>
          </List>
        </div>
        <Divider />
        <ExpansionPanel
          disabled={hasNoContractTypes}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              variant="subheading"
              style={listHeadingStyle}
            >
              Contract Types
            </Typography>
          </ExpansionPanelSummary>
          {hasNoContractTypes ? null : this.getContractTypesJSX()}
        </ExpansionPanel>
        <ExpansionPanel
          disabled={hasNoContractInstances}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              variant="subheading"
              style={listHeadingStyle}
            >
              Contract Instances
            </Typography>
          </ExpansionPanelSummary>
          {hasNoContractInstances ? null : this.getContractInstancesJSX()}
        </ExpansionPanel>
        <List style={{ paddingTop: 0, paddingBottom: 0}}>
          <Divider />
          <ListItem button>
            <ListItemIcon>
              <GetAppIcon />
            </ListItemIcon>
            <ListItemText>
              <a
                href={this.state.storageHref}
                download="dapp-grapher-state.json"
                style={{
                  textDecoration: 'inherit',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Download State
              </a>
            </ListItemText>
          </ListItem>
        </List>
      </Fragment>
    )
  }

  getNestedList = (id, icon, displayText, children) => {
    return (
      <Fragment>
        <ListItem button onClick={() => this.handleParentListClick([id])}>
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText
            inset
            primary={displayText} />
          {this.state[id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
        <Collapse in={this.state[id]} timeout="auto" unmountOnExit>
          <List disablePadding>
            {children}
          </List>
        </Collapse>
      </Fragment>
    )
  }

  getListButton = (disabled, onClick, icon, displayText) => {
    return (
      <Fragment>
        <ListItem button
          disabled={disabled}
          onClick={onClick}
        >
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText primary={displayText}/>
        </ListItem>
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
          instanceTypes[instance.type][address] = !!instance.truffleContract
        } else {
          instanceTypes[instance.type] = {
            [address]: !!instance.truffleContract,
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
        selectedContractAddress={_this.props.selectedContractAddress}
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
  selectedContractAddress: PropTypes.string,
  hasGraphs: PropTypes.bool,
  drawerOpen: PropTypes.bool,
}

/* subcomponents */

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
        contractGraphTypes._constructor,
        { contractName: this.props.contractName }
      ))
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

/**
 * HELPERS
 */

/**
 * encodes persisted storage as an href for downloading
 * @return {string} href attribute for an HTML anchor
 */
function getStorageHref () {
 return 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('dapp-grapher'))
}
