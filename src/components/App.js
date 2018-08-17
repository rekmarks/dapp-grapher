
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

import AppModal from './AppModal'
import ContractForm from './ContractForm'
import Grapher from './Grapher'
import Header from './Header'
import ResourceMenu from './ResourceMenu'
import withRoot from '../withRoot'

// Reducer imports

import {
  addContractType,
  addInstance,
  callInstance,
  deploy,
  selectContractAddress,
} from '../redux/reducers/contracts'

import {
  createGraph,
  deleteGraph,
  deleteAllGraphs,
  getCreateGraphParams,
  selectGraph,
} from '../redux/reducers/grapher'

import { logRenderError } from '../redux/reducers/renderErrors'

import {
  closeContractForm,
  openContractForm,
  selectContractFunction,
  toggleResourceMenu,
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
      drawerOpen: false,
      graphHeight: null,
      graphWidth: null,
    }
  }

  handleDrawerOpen = () => {
    this.setState({ drawerOpen: true })
  }

  handleDrawerClose = () => {
    this.setState({ drawerOpen: false })
  }

  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and, in the future, re-render with error message
    this.props.logRenderError(error, errorInfo)
  }

  render () {

    const classes = this.props.classes

    let currentGraph = null
    if (this.props.selectedGraphObject) { currentGraph = this.props.selectedGraphObject.toJS() }

    return (
      <Fragment>
        <CssBaseline />
        <div className={'App ' + classes.root} >
          <AppBar
            position="absolute"
            className={classNames(classes.appBar, this.state.drawerOpen && classes.appBarShift)}
          >
            <Toolbar disableGutters={!this.state.drawerOpen} className={classes.toolbar}>
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
              <Typography variant="title" color="inherit" noWrap className={classes.title}>
                Dapp Grapher
              </Typography>
              <Header
                classes={classes}
                contractInstances={this.props.contractInstances}
                web3Injected={!!this.props.web3}
              />
            </Toolbar>
          </AppBar>
          <Drawer
          variant="persistent"
            classes={{
              paper: classNames(classes.drawerPaper, !this.state.drawerOpen && classes.drawerPaperClose),
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
                hasGraphs={this.props.hasGraphs} />
          </Drawer>
          <main className="App-graph-container" ref={this.graphContainerRef} >
            {
              currentGraph
              ? <Grapher
                  graph={currentGraph}
                  openContractForm={this.props.openContractForm}
                  graphContainer={this.graphContainerRef} />
              : <h2 className="App-no-graph-label">Please select a graph</h2>
            }
          </main>
          <div className="App-modal-container" >
            {
              currentGraph
              ? (
                  <AppModal
                    classes={{ root: classes.root, paper: classes.paper }}
                    open={this.props.contractModal}
                    onClose={this.props.closeContractForm}
                  >
                    <ContractForm
                      classes={{
                         container: classes.container,
                         textField: classes.textField,
                         button: classes.button,
                         nested: classes.nested,
                      }}
                      contractAddress={this.props.selectedContractAddress}
                      nodes={currentGraph.elements.nodes}
                      contractName={currentGraph.name}
                      graphType={currentGraph.type}
                      deploy={this.props.deploy}
                      callInstance={this.props.callInstance}
                      closeContractForm={this.props.closeContractForm}
                      selectContractFunction={this.props.selectContractFunction}
                      selectedContractFunction={this.props.selectedContractFunction}
                      heading={currentGraph.name} />
                  </AppModal>
                )
              : null
            }

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
  deploy: PropTypes.func,
  addInstance: PropTypes.func,
  callInstance: PropTypes.func,
  contractInstances: PropTypes.object,
  contractTypes: PropTypes.object,
  selectedContractAddress: PropTypes.string,
  selectContractAddress: PropTypes.func,
  // grapher
  createGraph: PropTypes.func,
  deleteGraph: PropTypes.func,
  deleteAllGraphs: PropTypes.func,
  selectGraph: PropTypes.func,
  selectedGraphId: PropTypes.string,
  selectedGraphObject: PropTypes.object,
  hasGraphs: PropTypes.bool,
  // renderErrors
  logRenderError: PropTypes.func,
  // ui
  contractModal: PropTypes.bool,
  closeContractForm: PropTypes.func,
  openContractForm: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
  resourceMenuOpen: PropTypes.bool,
  toggleResourceMenu: PropTypes.func,
  // web3
  account: PropTypes.string,
  networkId: PropTypes.string,
  getWeb3: PropTypes.func,
  web3: (props, propName, componentName) => {
    if (props[propName] !== null && typeof props[propName] !== 'object') {
      return new Error(
        'Invalid ' + propName + ': Neither null nor an object for component ' + componentName
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
    // grapher
    selectedGraphId: state.grapher.selectedGraphId,
    selectedGraphObject: state.grapher.graphs[state.grapher.selectedGraphId],
    hasGraphs: Object.keys(state.grapher.graphs).length >= 1,
    // ui
    contractModal: state.ui.contractForm.open,
    selectedContractFunction: state.ui.contractForm.selectedFunction,
    resourceMenuOpen: state.ui.resourceMenu.open,
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
    deploy: (contractName, constructorParams) =>
      dispatch(deploy(contractName, constructorParams)),
    addInstance: (contractName, address) =>
      dispatch(addInstance(contractName, address)),
    callInstance: (address, functionName, params = null, sender = null) =>
      dispatch(callInstance(address, functionName, params, sender)),
    selectContractAddress: address => dispatch(selectContractAddress(address)),
    // grapher
    createGraph: params => dispatch(createGraph(params)),
    deleteGraph: graphId => dispatch(deleteGraph(graphId)),
    deleteAllGraphs: () => dispatch(deleteAllGraphs()),
    selectGraph: graphId => dispatch(selectGraph(graphId)),
    // renderErrors
    logRenderError: (error, errorInfo) => dispatch(logRenderError(error, errorInfo)),
    // ui
    closeContractForm: () => dispatch(closeContractForm()),
    openContractForm: () => dispatch(openContractForm()),
    selectContractFunction: func => dispatch(selectContractFunction(func)),
    toggleResourceMenu: () => dispatch(toggleResourceMenu()),
    // web3
    getWeb3: () => dispatch(getWeb3()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRoot(withStyles(appStyles)(App)))
