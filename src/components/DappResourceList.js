
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
// import CloudQueueIcon from '@material-ui/icons/CloudQueue'
// import SubjectIcon from '@material-ui/icons/Subject'

// import NestedList from './common/NestedList'
// import ListButton from './common/ListButton'

// import { contractGraphTypes } from '../graphing/parseContract'
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
          onClick={e => { console.log('clicky clik') }}
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

  getTemplateListItems = (dapps) => {

    const dappIds = Object.keys(dapps)

    if (dappIds.length < 1) return null

    // return dappIds.map( id => {

    //   return (
    //     <NestedList
    //       key={id}
    //     >
    //       <TemplateListButton />
    //     </NestedList>
    //   )
    // })
    return ''
  }
}

DappResourceList.propTypes = {
  // classes: PropTypes.object.isRequired,
  dapps: PropTypes.object.isRequired,
}

export default withStyles(styles)(DappResourceList)
