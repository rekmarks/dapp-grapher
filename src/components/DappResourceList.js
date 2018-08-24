
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import ExtensionIcon from '@material-ui/icons/Extension'
import CloudQueueIcon from '@material-ui/icons/CloudQueue'

import NestedList from './common/NestedList'
import ListButton from './common/ListButton'

// import { contractGraphTypes } from '../graphing/graphGenerator'
import { grapherModes } from '../redux/reducers/grapher'
import { spacingUnit } from '../withMuiRoot'

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

class DappResourceList extends Component {

  handleParentListClick = id => {
    this.setState(state => ({ [id]: !state[id] }))
  }

  render () {
    return (
      <Fragment>
        <ListItem button
          onClick={ () => this.props.setGrapherMode(grapherModes.createDapp) }
          style={{ paddingLeft: spacingUnit * 4 }}
        >
          <ListItemIcon>
            <AddCircleOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Create Template" />
        </ListItem>
        {this.getTemplateListItems(this.props.dapps)}
      </Fragment>
    )
  }

  handleDeployNewClick = (templateId, graphId) => {
    this.props.selectDappTemplate(templateId)
    this.props.selectGraph(graphId)
  }

  getTemplateListItems = dapps => {

    const dappIds = Object.keys(dapps)

    if (dappIds.length < 1) return null

    return dappIds.map(id => {

      const hasDeployed = Object.keys(dapps[id].deployed).length > 0

      return (
        <NestedList
          key={id}
          icon={(<ExtensionIcon />)}
          displayText={dapps[id].name}
          buttonPadding={spacingUnit * 4}
        >
          <ListButton
            disabled={false}
            displayText={'Deploy New'}
            icon={(<AddCircleOutlineIcon />)}
            onClick={ () => this.handleDeployNewClick(id, dapps[id].dappGraphId)}
            style={{ paddingLeft: spacingUnit * 6 }} />
          <NestedList
            icon={(<CloudQueueIcon />)}
            displayText="Deployed"
            disabled={!hasDeployed}
            buttonPadding={spacingUnit * 6}
          >
            {
              hasDeployed
              ? this.getDeployedListItems(dapps[id].deployed)
              : null
            }
          </NestedList>
        </NestedList>
      )
    })
  }

  getDeployedListItems = deployed => {

  }
}

DappResourceList.propTypes = {
  // classes: PropTypes.object.isRequired,
  dapps: PropTypes.object.isRequired,
  setGrapherMode: PropTypes.func,
  selectGraph: PropTypes.func,
  selectDappTemplate: PropTypes.func,
}

export default withStyles(styles)(DappResourceList)
