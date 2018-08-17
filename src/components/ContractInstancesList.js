
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import StorageIcon from '@material-ui/icons/Storage'

import { contractGraphTypes } from '../graphing/parseContract'

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
})

class ContractInstancesList extends Component {

  state = { open: true }

  constructor (props) {
    super(props)
    this.state = {}
    Object.keys(props.instanceTypes).forEach(type => {
      this.state[type] = false
    })
  }

  handleItemClick = (id) => {
    this.setState(state => ({ [id]: !state[id] }))
  }

  render () {

    const classes = this.props.classes

    return (
      <div className={classes.root}>
        <List>
          {this.getListItems()}
        </List>
      </div>
    )
  }

  getListItems = () => {

    const _this = this

    const listItemsJSX = []
    Object.keys(_this.props.instanceTypes).forEach(type => {

      // TODO: should the Collapse have: unmountOnExit

      listItemsJSX.push(
        <Fragment key={type}>
          <ListItem button onClick={() => _this.handleItemClick(type)}>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText inset primary={type} />
            {_this.state[type] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={_this.state[type]} timeout="auto" unmountOnExit>
            <List disablePadding>
              {_this.getInnerListItems(type, _this.props.instanceTypes[type])}
            </List>
          </Collapse>
        </Fragment>
      )
    })

    return listItemsJSX
  }

  getInnerListItems = (type, instances) => {

    const _this = this

    return Object.keys(instances).map(address => {

      const functionsGraphId =
          _this.props.contractTypes[type][contractGraphTypes.functions]

      return (
        <Fragment key={address}>
          <ContractInstanceListButton
            classes={_this.props.classes}
            contractName={type}
            address={address}
            selectContractAddress={_this.props.selectContractAddress}
            selectedContractAddress={_this.props.selectedContractAddress}
            addInstance={_this.props.addInstance}
            hasInstance={instances[address]}
            functionsGraphId={functionsGraphId}
            getCreateGraphParams={_this.props.getCreateGraphParams}
            createGraph={_this.props.createGraph}
            selectGraph={_this.props.selectGraph}
            selectedGraphId={_this.props.selectedGraphId} />
        </Fragment>
      )

    })
  }
}

ContractInstancesList.propTypes = {
  classes: PropTypes.object.isRequired,
  contractTypes: PropTypes.object,
  instanceTypes: PropTypes.object,
  selectContractAddress: PropTypes.func,
  selectedContractAddress: PropTypes.string,
  addInstance: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  createGraph: PropTypes.func,
  selectGraph: PropTypes.func,
}

export default withStyles(styles)(ContractInstancesList)

class ContractInstanceListButton extends Component {

  render () {

    const classes = this.props.classes

    return (
      <ListItem button
        className={classes.nested}
        disabled={this.props.selectedGraphId &&
            this.props.selectedContractAddress === this.props.address}
        onClick={this.onFunctionsClick}
      >
        <ListItemIcon>
          <StorageIcon />
        </ListItemIcon>
        <ListItemText inset primary={this.props.address} />
      </ListItem>
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
        contractGraphTypes.functions,
        {contractName: this.props.contractName}
      ))
    }
    // TODO: unsafe (addInstance could take too long)
    this.props.selectContractAddress(this.props.address)
  }
}

ContractInstanceListButton.propTypes = {
  classes: PropTypes.object.isRequired,
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
  selectedContractAddress: PropTypes.string,
  functionsGraphId: PropTypes.string,
}
