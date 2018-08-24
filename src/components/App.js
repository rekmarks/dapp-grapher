
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

import AppModal from './common/AppModal'
import ContractForm from './ContractForm'
import Grapher from './Grapher'
import Header from './Header'
import ResourceMenu from './ResourceMenu'
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
  deployDapp,
  selectDappTemplate,
  updateWipDeployment,
} from '../redux/reducers/dapps'

import {
  grapherModes,
  setGrapherMode,
  createGraph,
  deleteGraph,
  deleteAllGraphs,
  getCreateGraphParams,
  selectGraph,
  saveWipGraph,
  updateWipGraph,
} from '../redux/reducers/grapher'

import { logRenderError } from '../redux/reducers/renderErrors'

import {
  closeAppModal,
  openAppModal,
  selectContractFunction,
} from '../redux/reducers/ui'

import { getWeb3 } from '../redux/reducers/web3'

// Style imports

import './style/App.css'
import appStyles from './style/App.style'

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
    this.graphContainerRef = React.createRef()
    this.state = {
      drawerOpen: true,
      graphHeight: null,
      graphWidth: null,
      selectedGraph: null,
      insertionGraph: null,
    }
  }

  handleDrawerOpen = () => {
    this.setState({ drawerOpen: true })
  }

  handleDrawerClose = () => {
    this.setState({ drawerOpen: false })
  }

  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and, in the future,
    // re-render with error message
    this.props.logRenderError(error, errorInfo)
  }

  render () {

    const classes = this.props.classes

    let selectedGraph = null
    let insertionGraph = null

    if (this.props.selectedGraphObject) {

      selectedGraph = this.props.selectedGraphObject.toJS()

    } else if (this.props.insertionGraphObject) {

      insertionGraph = this.props.insertionGraphObject.toJS()
    }

    return (
      <Fragment>
        <CssBaseline />
        <div className={'App ' + classes.root} >
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
              <Header
                classes={classes}
                web3Injected={!!this.props.web3}
              />
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
                addInstance={this.props.addInstance}
                networkId={this.props.networkId}
                contractTypes={this.props.contractTypes}
                contractInstances={this.props.contractInstances}
                createGraph={this.props.createGraph}
                getCreateGraphParams={getCreateGraphParams} // helper, not dispatch
                deleteGraph={this.props.deleteGraph}
                deleteAllGraphs={this.props.deleteAllGraphs}
                selectGraph={this.props.selectGraph}
                selectedGraphId={this.props.selectedGraphId}
                selectContractAddress={this.props.selectContractAddress}
                selectedContractAddress={this.props.selectedContractAddress}
                hasGraphs={this.props.hasGraphs}
                dapps={this.props.dapps}
                insertionGraphId={this.props.insertionGraphId}
                saveWipGraph={this.props.saveWipGraph}
                hasWipGraph={
                  this.props.wipGraph
                  ? Boolean(this.props.wipGraph.id)
                  : false
                }
                selectDappTemplate={this.props.selectDappTemplate}
                hasSelectedDappTemplate={Boolean(this.props.selectedDappTemplate)}
                hasWipDeployment={Boolean(this.props.wipDappDeployment)}
                deployDapp={this.props.deployDapp} />
          </Drawer>
          <main className="App-graph-container" ref={this.graphContainerRef} >
            {
              selectedGraph ||
              this.props.grapherMode === grapherModes.createDapp
              ? <Grapher
                  accountGraph={this.props.accountGraph}
                  graphContainer={this.graphContainerRef}
                  grapherMode={this.props.grapherMode}
                  graphInsertions={this.props.graphInsertions}
                  insertionGraph={insertionGraph}
                  insertionGraphId={this.props.insertionGraphId}
                  openContractForm={this.props.openAppModal}
                  selectedGraph={selectedGraph}
                  selectedGraphId={this.props.selectedGraphId}
                  updateWipGraph={this.props.updateWipGraph}
                  wipGraph={this.props.wipGraph}
                  selectContractFunction={this.props.selectContractFunction} />
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
          <div className="App-modal-container" >
            <AppModal
              classes={{ root: classes.root, paper: classes.paper }}
              open={this.props.appModal}
              onClose={this.props.closeAppModal}
            >
              {
                selectedGraph
                ? (
                    <ContractForm
                      classes={{
                         container: classes.container,
                         textField: classes.textField,
                         button: classes.button,
                         nested: classes.nested,
                      }}
                      contractAddress={this.props.selectedContractAddress}
                      selectedGraph={selectedGraph}
                      deployContract={this.props.deployContract}
                      callInstance={this.props.callInstance}
                      closeContractForm={this.props.closeAppModal}
                      selectContractFunction={this.props.selectContractFunction}
                      selectedContractFunction={this.props.selectedContractFunction}
                      heading={selectedGraph.name}
                      wipDappDeployment={this.props.wipDappDeployment}
                      updateWipDappDeployment={this.props.updateWipDappDeployment}
                      selectedDappTemplate={this.props.selectedDappTemplate} />
                  )
                : null
              }
            </AppModal>
          </div>
        </div>
      </Fragment>
    )
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
  selectedDeployedDapp:PropTypes.object, // TODO
  selectedDappTemplate:PropTypes.object,
  wipDappDeployment:PropTypes.object,
  // grapher
  accountGraph: PropTypes.object,
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  grapherMode: PropTypes.string,
  graphInsertions: PropTypes.number,
  hasGraphs: PropTypes.bool,
  insertionGraphId: PropTypes.string,
  insertionGraphObject: PropTypes.object,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  selectedGraphObject: PropTypes.object,
  setGrapherMode: PropTypes.func,
  saveWipGraph: PropTypes.func,
  updateWipGraph: PropTypes.func,
  wipGraph: PropTypes.object,
  // renderErrors
  logRenderError: PropTypes.func,
  // ui
  appModal: PropTypes.bool,
  closeAppModal: PropTypes.func,
  openAppModal: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
  // web3
  account: PropTypes.string,
  networkId: PropTypes.string,
  getWeb3: PropTypes.func,
  web3: (props, propName, componentName) => {
    if (props[propName] !== null && typeof props[propName] !== 'object') {
      return new Error(
        'Invalid ' + propName +
        ': Neither null nor an object for component ' + componentName
      )
    }
  },
}

function mapStateToProps (state) {
  return {
    // contracts
    contractInstances: state.contracts.instances,
    contractTypes: state.contracts.types,
    selectedContractAddress: state.contracts.selectedAddress,
    // dapps
    dapps: state.dapps.templates,
    selectedDeployedDapp:
      state.dapps.selectedTemplateId && state.dapps.selectedDeployedId
      ? state.dapps.templates[state.dapps.selectedTemplateId][state.dapps.selectedDeployedId]
      : null,
    selectedDappTemplate:
      state.dapps.selectedTemplateId
      ? state.dapps.templates[state.dapps.selectedTemplateId]
      : null,
    wipDappDeployment: state.dapps.wipDeployment,
    // grapher
    accountGraph: state.grapher.accountGraph,
    grapherMode: state.grapher.mode,
    insertionGraphId: state.grapher.insertionGraphId,
    insertionGraphObject: state.grapher.graphs[state.grapher.insertionGraphId],
    graphInsertions: state.grapher.insertions,
    selectedGraphId: state.grapher.selectedGraphId,
    selectedGraphObject: state.grapher.graphs[state.grapher.selectedGraphId],
    hasGraphs: Object.keys(state.grapher.graphs).length >= 1,
    wipGraph: state.grapher.wipGraph,
    // ui
    appModal: state.ui.appModal.open,
    selectedContractFunction: state.ui.contractForm.selectedFunction,
    // web3
    account: state.web3.account,
    networkId: state.web3.networkId,
    web3: state.web3.injected,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // contracts // TODO: where add contract type?
    addContractType: contractJSON => dispatch(addContractType(contractJSON)),
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
    // grapher
    createGraph: params => dispatch(createGraph(params)),
    deleteGraph: graphId => dispatch(deleteGraph(graphId)),
    deleteAllGraphs: () => dispatch(deleteAllGraphs()),
    selectGraph: graphId => dispatch(selectGraph(graphId)),
    saveWipGraph: () => dispatch(saveWipGraph()),
    updateWipGraph: wipGraph => dispatch(updateWipGraph(wipGraph)),
    // renderErrors
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    // ui
    closeAppModal: () => dispatch(closeAppModal()),
    openAppModal: () => dispatch(openAppModal()),
    selectContractFunction: func => dispatch(selectContractFunction(func)),
    setGrapherMode: contentKey => dispatch(setGrapherMode(contentKey)),
    // web3
    getWeb3: () => dispatch(getWeb3()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withMuiRoot(withStyles(appStyles)(App)))
