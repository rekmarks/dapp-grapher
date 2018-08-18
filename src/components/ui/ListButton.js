
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import ListItemIcon from '@material-ui/core/ListItemIcon'

export default class ListButton extends Component {

  render () {
    return (
      <Fragment>
        <ListItem button
          disabled={this.props.disabled}
          onClick={this.props.onClick}
        >
          <ListItemIcon>
            {this.props.icon}
          </ListItemIcon>
          <ListItemText primary={this.props.displayText}/>
        </ListItem>
      </Fragment>
    )
  }
}

ListButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.object,
  displayText: PropTypes.string,
}
