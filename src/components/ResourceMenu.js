
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
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
import CloseIcon from '@material-ui/icons/Close'

import ContractResourceList from './ContractResourceList'
import DappResourceList from './DappResourceList'
import NestedList from './common/NestedList'
import ListButton from './common/ListButton'

import { grapherModes, getCreateGraphParams } from '../redux/reducers/grapher'
import { modalContentTypes } from '../redux/reducers/ui'

/**
 * Parent component for primary app menu/toolbar. Visually contained within
 * drawer on screen left.
 *
 * @extends {Component}
 */
export default class ResourceMenu extends Component {

  constructor (props) {

    // for local browser storage functionality
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

  render () {

    const graphResourceClasses = {
      nested: this.props.classes.nested,
      root: this.props.classes.root,
    }

    const resources = {}

    if (this.props.grapherMode === grapherModes.main) {

      resources.top = (
        <Fragment>
          {
            this.props.selectedDappTemplateId
            ? <ListButton
                disabled={!this.props.hasWipDeployment}
                onClick={() => this.props.openDappForm()}
                icon={(<CloudUploadIcon />)}
                displayText="Deploy Dapp" />
            : null
          }
        </Fragment>
      )

      resources.mid = (
        <NestedList
          icon={(<AppsIcon />)}
          displayText="Dapps"
        >
          <DappResourceList
            dapps={this.props.dapps}
            setGrapherMode={this.props.setGrapherMode}
            selectDisplayGraph={this.props.selectDisplayGraph}
            selectTemplate={this.props.selectDappTemplate}
            selectDeployed={this.props.selectDeployedDapp}
            selectedTemplateId={this.props.selectedDappTemplateId}
            selectedDeployedId={this.props.selectedDeployedDappId} />
        </NestedList>
      )

      resources.bottom = (
        <Fragment>
          <Divider />
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
              disabled={!this.props.displayGraphId}
              onClick={
                () => this.props.deleteGraph(this.props.displayGraphId)
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
        </Fragment>
      )
    } else if (this.props.grapherMode === grapherModes.createDapp) {

      resources.top = (
        <Fragment>
          <ListButton
            disabled={!this.props.hasWipGraph}
            onClick={() => {
              this.props.openModal(modalContentTypes.dappForm)
            }}
            icon={(<SaveIcon />)}
            displayText="Save Template" />
        </Fragment>
      )

      resources.mid = ''

      resources.bottom = ''
    }

    return (
      <div id="ResourceMenu-main" style={{overflowY: 'auto'}}>
        <List disablePadding>
          <ListButton
            disabled={
              !this.props.displayGraphId &&
              this.props.grapherMode === grapherModes.main
            }
            onClick={() => this.props.setGrapherMode(grapherModes.main)}
            icon={<CloseIcon />}
            displayText={
              this.props.grapherMode === grapherModes.createDapp
              ? 'Discard Graph'
              : 'Deselect Graph'
            }
          />
          {resources.top}
        </List>
        <Divider />
        {resources.mid}
        <NestedList
          icon={(<StorageIcon />)}
          displayText="Contracts"
        >
          <ContractResourceList
            classes={graphResourceClasses}
            addContractType={this.props.addContractType}
            grapherMode={this.props.grapherMode}
            contractTypes={this.props.contractTypes}
            instanceTypes={this.getContractInstanceTypes()}
            contractInstances={this.props.contractInstances}
            selectContractAddress={this.props.selectContractAddress}
            selectedContractAddress={this.props.selectedContractAddress}
            addInstance={this.props.addInstance}
            getCreateGraphParams={getCreateGraphParams}
            createGraph={this.props.createGraph}
            selectDisplayGraph={this.props.selectDisplayGraph}
            displayGraphId={this.props.displayGraphId}
            getGraph={this.props.getGraph}
            hasWipDeployment={this.props.hasWipDeployment} />
        </NestedList>
        {resources.bottom}
      </div>
    )
  }

  /**
   * Gets contract instance Truffle artifacts by address and contract type.
   *
   * TODO: replace this and its returned object's related functionality in
   * ContractResourceList with something that isn't as boneheaded.
   *
   * @returns {object} contract type : address : truffleContract
   */
  getContractInstanceTypes = () => {

    if (
      !this.props.networkId ||
      !this.props.contractInstances ||
      Object.keys(this.props.contractInstances).length === 0
    ) return null

    // get all instances for current account and networkId by type
    const instanceTypes = Object.values(
      this.props.contractInstances
    ).reduce((acc, i) => {
      if (!acc[i.type]) acc[i.type] = {}
      acc[i.type][i.address] = Boolean(i.truffleContract)
      return acc
    }, {})

    if (Object.keys(instanceTypes).length === 0) {
      console.error('no contract instances found')
    }
    return instanceTypes
  }
}

ResourceMenu.propTypes = {
  classes: PropTypes.object,
  account: PropTypes.string,
  addContractType: PropTypes.func,
  addInstance: PropTypes.func,
  networkId: PropTypes.string,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  selectDisplayGraph: PropTypes.func,
  displayGraphId: PropTypes.string,
  selectContractAddress: PropTypes.func,
  selectedContractAddress: PropTypes.string,
  hasGraphs: PropTypes.bool,
  drawerOpen: PropTypes.bool,
  dapps: PropTypes.object,
  grapherMode: PropTypes.string,
  setGrapherMode: PropTypes.func,
  hasWipGraph: PropTypes.bool,
  openDappForm: PropTypes.func,
  hasWipDeployment: PropTypes.bool,
  selectDappTemplate: PropTypes.func,
  selectedDappTemplateId: PropTypes.string,
  selectedDeployedDappId: PropTypes.string,
  selectDeployedDapp: PropTypes.func,
  openModal: PropTypes.func,
  getGraph: PropTypes.func,
}

/**
 * HELPERS
 */

/**
 * Encodes persisted storage as an href for downloading
 *
 * @return {string} href attribute for an HTML anchor
 */
function getStorageHref () {
 return 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('dapp-grapher'))
}
