
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import AppsIcon from '@material-ui/icons/Apps'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import DeleteIcon from '@material-ui/icons/Delete'
import GetAppIcon from '@material-ui/icons/GetApp'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import StorageIcon from '@material-ui/icons/Storage'
import BuildIcon from '@material-ui/icons/Build'
import SaveIcon from '@material-ui/icons/Save'

import ContractResourceList from './ContractResourceList'
import DappResourceList from './DappResourceList'
import NestedList from './common/NestedList'
import ListButton from './common/ListButton'

import { grapherModes } from '../redux/reducers/grapher'

export default class ResourceMenu extends Component {

  constructor (props) {

    super(props)
    this.state = {
      storageHref: getStorageHref(),
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

    const graphResourceClasses = {
      nested: this.props.classes.nested,
      root: this.props.classes.root,
    }

    const resources = {}

    if (this.props.grapherMode === grapherModes.main) {

      resources.top = (
        <List disablePadding>
          {
            this.props.selectedDappTemplateId
            ? <ListButton
                disabled={!this.props.hasWipDeployment}
                onClick={() => this.props.deployDapp('Crowdsale')} // TODO: hardcoded
                icon={(<CloudUploadIcon />)}
                displayText="Deploy Dapp" />
            : null
          }
          <NestedList
            icon={(<BuildIcon />)}
            displayText="Dev Tools"
          >
            <ListButton
              disabled={!this.props.hasGraphs}
              onClick={this.props.deleteAllGraphs}
              icon={(<DeleteIcon />)}
              displayText="Delete All Graphs" />
            <ListButton
              disabled={!this.props.selectedGraphId}
              onClick={
                () => this.props.deleteGraph(this.props.selectedGraphId)
              }
              icon={(<DeleteIcon />)}
              displayText="Delete Selected Graph" />
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
          </NestedList>
        </List>
      )

      resources.bottom = (
        <NestedList
          icon={(<AppsIcon />)}
          displayText="Dapps"
          isOpen
        >
          <DappResourceList
            dapps={this.props.dapps}
            setGrapherMode={this.props.setGrapherMode}
            selectGraph={this.props.selectGraph}
            selectTemplate={this.props.selectDappTemplate}
            selectDeployed={this.props.selectDeployedDapp}
            selectedTemplateId={this.props.selectedDappTemplateId}
            selectedDeployedId={this.props.selectedDeployedDappId} />
        </NestedList>
      )
    } else if (this.props.grapherMode === grapherModes.createDapp) {

      resources.top = (
        <List disablePadding>
          <ListButton
            disabled={!this.props.hasWipGraph}
            onClick={() => {
              this.props.saveWipGraph()
              this.props.setGrapherMode(grapherModes.main)
            }}
            icon={(<SaveIcon />)}
            displayText="Save" />
          <ListButton
            disabled={false} // TODO: dapp graph is valid
            onClick={() => this.props.setGrapherMode(grapherModes.main)}
            icon={(<DeleteIcon />)}
            displayText="Discard" />
        </List>
      )

      resources.bottom = (
        ''
      )
    }

    return (
      <div id="ResourceMenu-main" style={{overflowY: 'auto'}}>
        {resources.top}
        <Divider />
        <NestedList
          icon={(<StorageIcon />)}
          displayText="Contracts"
        >
          <ContractResourceList
            classes={graphResourceClasses}
            grapherMode={this.props.grapherMode}
            contractTypes={this.props.contractTypes}
            instanceTypes={this.getInstanceTypes()}
            selectContractAddress={this.props.selectContractAddress}
            selectedContractAddress={this.props.selectedContractAddress}
            addInstance={this.props.addInstance}
            getCreateGraphParams={this.props.getCreateGraphParams}
            createGraph={this.props.createGraph}
            selectGraph={this.props.selectGraph}
            selectedGraphId={this.props.selectedGraphId} />
        </NestedList>
        {resources.bottom}
      </div>
    )
  }

  getInstanceTypes = () => {

    if (
      !this.props.networkId ||
      !this.props.contractInstances ||
      !this.props.contractInstances[this.props.networkId]
    ) return null

    // get all instances for current account and networkId by type
    const instanceTypes = {}
    Object.keys(
      this.props.contractInstances[this.props.networkId]
    ).forEach(address => {

      const instance =
        this.props.contractInstances[this.props.networkId][address]

      if (instance.account === this.props.account) {
        if (instanceTypes[instance.type]) {
          instanceTypes[instance.type][address] = !!instance.truffleContract
        } else {
          instanceTypes[instance.type] = {
            [address]: !!instance.truffleContract,
          }
        }
      }
    })

    if (Object.keys(instanceTypes).length === 0) {
      throw new Error('no contract instances found')
    }

    return instanceTypes
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
  dapps: PropTypes.object,
  grapherMode: PropTypes.string,
  setGrapherMode: PropTypes.func,
  saveWipGraph: PropTypes.func,
  hasWipGraph: PropTypes.bool,
  deployDapp: PropTypes.func,
  hasWipDeployment: PropTypes.bool,
  selectDappTemplate: PropTypes.func,
  selectedDappTemplateId: PropTypes.string,
  selectedDeployedDappId: PropTypes.string,
  selectDeployedDapp: PropTypes.func,
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
