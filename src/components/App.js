
// Package imports

import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

// Custom component imports

import ContractForm from './ContractForm'
import DappForm from './DappForm'
import Grapher from './Grapher'
import Modal from './common/AppModal'
import ResourceMenu from './ResourceMenu'
import Snackbar from './common/AppSnackbar'

import withMuiRoot from '../withMuiRoot'

// Reducer imports

import {
  addContractType,
  addInstance,
  callInstance,
  deployContract,
  selectContractAddress,
} from '../redux/reducers/contracts'

import {
  addDappTemplate,
  deployDapp,
  selectDappTemplate,
  updateWipDeployment,
  selectDeployedDapp,
} from '../redux/reducers/dapps'

import {
  grapherModes,
  setGrapherMode,
  getGraph,
  createGraph,
  deleteGraph,
  deleteAllGraphs,
  selectFormGraph,
  selectDisplayGraph,
  updateWipGraph,
} from '../redux/reducers/grapher'

import { logRenderError } from '../redux/reducers/renderErrors'

import {
  addSnackbarNotification,
  closeModal,
  openModal,
  modalContentTypes,
  selectContractFunction,
  saveModalFormFieldValues,
} from '../redux/reducers/ui'

import { getWeb3 } from '../redux/reducers/web3'

// Misc. imports
import { updateAccountNode } from '../utils'
import { selectContractInstances } from '../selectors'

// Style imports

import './style/App.css'
import appStyles from './style/App.style'

/**
 * App
 *
 * @extends {Component}
 */
class App extends Component {

  /**
   * Dispatches getWeb3 action, sets ref for the graph container element,
   * sets necessary component-level ui state
   */
  constructor (props) {

    super(props)

    // Reloads the page if Ethereum network or accounts change
    // TODO: handle this gracefully
    window.ethereum.on('accountsChanged', accounts => {
      window.location.reload()
    })
    window.ethereum.on('networkChanged', networkId => {
      window.location.reload()
    })

    this.props.getWeb3()

    this.graphContainerRef = React.createRef()

    this.state = {
      drawerOpen: true, // left sidebar open by default
    }
  }

  /**
   * Handles opening the left sidebar
   */
  handleDrawerOpen = () => {
    this.setState({ drawerOpen: true })
  }

  /**
   * Handles closing the left sidebar
   */
  handleDrawerClose = () => {
    this.setState({ drawerOpen: false })
  }

  /**
   * Perfunctory React render error handling
   * Is called automagically be React on render errors
   */
  componentDidCatch (error, errorInfo) {
    // Catch errors in any child components and, in the future,
    // re-render with error message
    this.props.logRenderError(error, errorInfo)
  }

  render () {

    const classes = this.props.classes

    let displayGraph = null
    let insertionGraph = null

    // conversion from immutable data
    if (this.props.displayGraphObject) {
      displayGraph = updateAccountNode(
        this.props.displayGraphObject.toJS(),
        this.props.account
      )
    } else if (this.props.insertionGraphObject) {
      insertionGraph = this.props.insertionGraphObject.toJS()
    }

    return (
      <Fragment>
        <CssBaseline />
        <div className={classes.root} >
          <AppBar
            position="absolute"
            className={classNames(
              classes.appBar,
              this.state.drawerOpen && classes.appBarShift
            )}
          >
            <Toolbar
              disableGutters={!this.state.drawerOpen}
              className={classes.toolbar}
            >
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(
                  classes.menuButton,
                  this.state.drawerOpen && classes.menuButtonHidden,
                )}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="title"
                color="inherit"
                noWrap
                className={classes.title}
              >
                Dapp Grapher
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="persistent"
            anchor="left"
            classes={{
              paper: classNames(
                classes.drawerPaper,
                !this.state.drawerOpen && classes.drawerPaperClose
              ),
              docked: classNames(
                this.state.drawerOpen && classes.undocked,
              ),
            }}
            open={this.state.drawerOpen}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <ResourceMenu
                classes={classes}
                grapherMode={this.props.grapherMode}
                setGrapherMode={this.props.setGrapherMode}
                drawerOpen={this.state.drawerOpen}
                account={this.props.account}
                addContractType={this.props.addContractType}
                addInstance={this.props.addInstance}
                networkId={this.props.networkId}
                contractTypes={this.props.contractTypes}
                contractInstances={this.props.contractInstances}
                createGraph={this.props.createGraph}
                deleteGraph={this.props.deleteGraph}
                deleteAllGraphs={this.props.deleteAllGraphs}
                selectDisplayGraph={this.props.selectDisplayGraph}
                displayGraphId={this.props.displayGraphId}
                selectContractAddress={this.props.selectContractAddress}
                selectedContractAddress={this.props.selectedContractAddress}
                hasGraphs={this.props.hasGraphs}
                dapps={this.props.dapps}
                insertionGraphId={this.props.insertionGraphId}
                hasWipGraph={
                  this.props.wipGraph
                  ? Boolean(this.props.wipGraph.id) // TODO: make dependent on grapherMode instead
                  : false
                }
                selectDappTemplate={this.props.selectDappTemplate}
                selectedDappTemplateId={this.props.selectedDappTemplateId}
                hasWipDeployment={Boolean(this.props.wipDappDeployment)}
                openDappForm={
                  () => this.props.openModal(modalContentTypes.dappForm)
                }
                selectDeployedDapp={this.props.selectDeployedDapp}
                selectedDeployedDappId={this.props.selectedDeployedDappId}
                openModal={this.props.openModal}
                getGraph={this.props.getGraph} />
          </Drawer>
          <main className="App-graph-container" ref={this.graphContainerRef} >
            {
              displayGraph ||
              this.props.grapherMode === grapherModes.createDapp
              ? <Grapher
                  accountGraph={this.props.accountGraph}
                  graphContainer={this.graphContainerRef}
                  grapherMode={this.props.grapherMode}
                  graphInsertions={this.props.graphInsertions}
                  insertionGraph={insertionGraph}
                  insertionGraphId={this.props.insertionGraphId}
                  openContractForm={
                    () => this.props.openModal(modalContentTypes.contractForm)
                  }
                  displayGraph={displayGraph}
                  displayGraphId={this.props.displayGraphId}
                  storeWipGraph={this.props.updateWipGraph}
                  wipGraph={this.props.wipGraph}
                  selectContractFunction={this.props.selectContractFunction}
                  selectFormGraph={this.props.selectFormGraph} />
              : (
                  <Typography
                    variant="title"
                    color="inherit"
                    noWrap
                    className={classes.title}
                    style={{
                      alignSelf: 'center',
                    }}
                  >
                    Please select a graph
                  </Typography>
                )
            }
          </main>
          <div>
            <Modal
              classes={{ root: classes.root, paper: classes.paper }}
              open={this.props.isModalOpen}
              onClose={this.props.closeModal}
            >
              {
                this.getModalContent(
                  classes, displayGraph
                )
              }
            </Modal>
            <Snackbar
              classes={{ close: this.props.classes.close }}
              duration={this.props.snackbarDuration}
              message={this.props.snackbarMessage} />
          </div>
        </div>
      </Fragment>
    )
  }

  /**
   * Returns the correct modal content, per state.ui.modal.content.
   * This is either a form for interacting with contracts - whether deployed
   * instances or undeployed constructors, alone or as part of dapp templates -
   * or dapps - when adding new templates or deploying instances of templates.
   *
   * @returns {jsx} the components constituting the modal's content
   */
  getModalContent = (classes, displayGraph) => {

    const formClasses = {
       container: classes.container,
       textField: classes.textField,
       button: classes.button,
       nested: classes.nested,
    }

    const formGraph = (
      this.props.selectedFormGraphObject
      ? this.props.selectedFormGraphObject.toJS()
      : displayGraph
    )

    const selectedFunctionName = (
      formGraph && this.props.selectedContractFunction
      ? formGraph.elements.nodes[
          this.props.selectedContractFunction
        ].displayName
      : null
    )

    switch (this.props.modalContent) {

      case modalContentTypes.contractForm:
        return (
          <ContractForm
            classes={formClasses}
            account={this.props.account}
            contractAddress={this.props.selectedContractAddress}
            graph={formGraph}
            deployContract={this.props.deployContract}
            callInstance={this.props.callInstance}
            closeContractForm={this.props.closeModal}
            selectContractFunction={this.props.selectContractFunction}
            selectedContractFunction={this.props.selectedContractFunction}
            heading={selectedFunctionName || formGraph.name}
            wipDappDeployment={this.props.wipDappDeployment}
            updateWipDappDeployment={this.props.updateWipDappDeployment}
            dappTemplate={
              this.props.selectedDappTemplateId
              ? this.props.dapps[this.props.selectedDappTemplateId]
              : null
            }
            fieldValues={this.props.modalFormFieldValues}
            storeFieldValues={
              this.props.saveModalFormFieldValues
            }
            addSnackbarNotification={this.props.addSnackbarNotification} />
        )

      case modalContentTypes.dappForm:
        return (
          <DappForm
            classes={formClasses}
            heading={
              this.props.grapherMode === grapherModes.createDapp
              ? 'Create New Template'
              : 'Deploy Dapp'
            }
            deployDapp={this.props.deployDapp}
            closeModal={this.props.closeModal}
            fieldValues={this.props.modalFormFieldValues}
            grapherMode={this.props.grapherMode}
            storeFieldValues={
              this.props.saveModalFormFieldValues
            }
            addDappTemplate={this.props.addDappTemplate}
            setGrapherMode={this.props.setGrapherMode} />
        )

      case null:
        return null

      default:
        console.error(
          'unhandled modal content type: ' + this.props.modalContent
        )
        return null
    }
  }
}

App.propTypes = {
  classes: PropTypes.object,
  // contracts
  addContractType: PropTypes.func,
  deployContract: PropTypes.func,
  addInstance: PropTypes.func,
  callInstance: PropTypes.func,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  selectedContractAddress: PropTypes.string,
  selectContractAddress: PropTypes.func,
  // dapps
  dapps: PropTypes.object,
  deployDapp: PropTypes.func,
  selectDappTemplate: PropTypes.func,
  updateWipDappDeployment: PropTypes.func,
  selectDeployedDapp: PropTypes.func,
  selectedDeployedDappId: PropTypes.string,
  selectedDappTemplateId: PropTypes.string,
  wipDappDeployment: PropTypes.object,
  // grapher
  accountGraph: PropTypes.object,
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  formGraphId: PropTypes.string,
  grapherMode: PropTypes.string,
  getGraph: PropTypes.func,
  graphInsertions: PropTypes.number,
  hasGraphs: PropTypes.bool,
  insertionGraphId: PropTypes.string,
  insertionGraphObject: PropTypes.object,
  selectFormGraph: PropTypes.func,
  selectedFormGraphObject: PropTypes.object,
  selectedFormGraph: PropTypes.object,
  selectDisplayGraph: PropTypes.func,
  displayGraphId: PropTypes.string,
  displayGraphObject: PropTypes.object,
  setGrapherMode: PropTypes.func,
  addDappTemplate: PropTypes.func,
  updateWipGraph: PropTypes.func,
  wipGraph: PropTypes.object,
  // renderErrors
  logRenderError: PropTypes.func,
  // ui
  isModalOpen: PropTypes.bool,
  closeModal: PropTypes.func,
  openModal: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
  modalFormFieldValues: PropTypes.object,
  modalContent: PropTypes.string,
  saveModalFormFieldValues: PropTypes.func,
  addSnackbarNotification: PropTypes.func,
  snackbarMessage: PropTypes.string,
  snackbarDuration: PropTypes.number,
  // web3
  account: PropTypes.string,
  networkId: PropTypes.string,
  getWeb3: PropTypes.func,
}

function mapStateToProps (state) {
  return {
    // contracts
    contractInstances: selectContractInstances(state),
    contractTypes: state.contracts.types,
    selectedContractAddress: state.contracts.selectedAddress,
    // dapps
    dapps: state.dapps.templates,
    selectedDappTemplateId: state.dapps.selectedTemplateId,
    selectedDeployedDappId:
      // a deployed id should only ever be selected if a template is also
      // selected, but, defensive programming
      state.dapps.selectedTemplateId && state.dapps.selectedDeployedId
      ? state.dapps.selectedDeployedId
      : null,
    wipDappDeployment: state.dapps.wipDeployment,
    // grapher
    accountGraph: state.grapher.accountGraph,
    grapherMode: state.grapher.mode,
    insertionGraphId: state.grapher.insertionGraphId,
    insertionGraphObject: state.grapher.graphs[state.grapher.insertionGraphId],
    graphInsertions: state.grapher.insertions,
    selectedFormGraphObject: state.grapher.graphs[state.grapher.formGraphId],
    displayGraphId: state.grapher.displayGraphId,
    displayGraphObject: state.grapher.graphs[state.grapher.displayGraphId],
    hasGraphs: Object.keys(state.grapher.graphs).length >= 1,
    wipGraph: state.grapher.wipGraph,
    formGraphId: state.grapher.formGraphId,
    // ui
    isModalOpen: state.ui.modal.open,
    modalContent: state.ui.modal.content,
    selectedContractFunction: state.ui.contractForm.selectedFunction,
    modalFormFieldValues: state.ui.modal.formFieldValues,
    snackbarMessage: state.ui.snackbar.message,
    snackbarDuration: state.ui.snackbar.duration,
    // web3
    account: state.web3.account,
    networkId: state.web3.networkId,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // contracts
    addContractType: (contractJson) => dispatch(addContractType(contractJson)),
    deployContract: (contractName, constructorParams) =>
      dispatch(deployContract(contractName, constructorParams)),
    addInstance: (contractName, address) =>
      dispatch(addInstance(contractName, address)),
    callInstance: (address, functionName, params = null, sender = null) =>
      dispatch(callInstance(address, functionName, params, sender)),
    selectContractAddress: address => dispatch(selectContractAddress(address)),
    // dapps
    deployDapp: (displayName) =>
      dispatch(deployDapp((displayName))),
    selectDappTemplate: dappTemplateId =>
      dispatch(selectDappTemplate(dappTemplateId)),
    updateWipDappDeployment: wipDeployment =>
      dispatch(updateWipDeployment(wipDeployment)),
    selectDeployedDapp: (templateId, deployedId) =>
      dispatch(selectDeployedDapp(templateId, deployedId)),
    // grapher
    createGraph: params => dispatch(createGraph(params)),
    deleteGraph: graphId => dispatch(deleteGraph(graphId)),
    deleteAllGraphs: () => dispatch(deleteAllGraphs()),
    getGraph: (graphId, graphType, contractName, address) =>
      dispatch(getGraph(graphId, graphType, contractName, address)),
    selectFormGraph: (contractName, instanceAddress) =>
      dispatch(selectFormGraph(contractName, instanceAddress)),
    selectDisplayGraph: graphId => dispatch(selectDisplayGraph(graphId)),
    addDappTemplate: templateName => dispatch(addDappTemplate(templateName)),
    updateWipGraph: wipGraph => dispatch(updateWipGraph(wipGraph)),
    // renderErrors
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    // ui
    addSnackbarNotification: (message, duration) =>
      dispatch(addSnackbarNotification(message, duration)),
    closeModal: () => dispatch(closeModal()),
    openModal: content => dispatch(openModal(content)),
    selectContractFunction: func => dispatch(selectContractFunction(func)),
    setGrapherMode: contentKey => dispatch(setGrapherMode(contentKey)),
    saveModalFormFieldValues: fieldValues =>
      dispatch(saveModalFormFieldValues(fieldValues)),
    // web3
    getWeb3: () => dispatch(getWeb3()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withMuiRoot(withStyles(appStyles)(App)))
