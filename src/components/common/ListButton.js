
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'

import ListItemIcon from '@material-ui/core/ListItemIcon'

/**
 * Visual component for buttons in lists in app resource menu.
 *
 * @extends {Component}
 */
export default class ListButton extends Component {

  render () {

    const listItem = (
      <ListItem button
        disabled={this.props.disabled}
        onClick={this.props.onClick}
        style={this.props.style ? this.props.style : {}}
      >
        {
          this.props.icon
          ? <ListItemIcon>
              {this.props.icon}
            </ListItemIcon>
          : null
        }
        <ListItemText
          primary={this.props.displayText}
          inset={this.props.inset ? this.props.inset : false}
          primaryTypographyProps={
            this.props.primaryTypographyProps
            ? this.props.primaryTypographyProps
            : {}
          } />
      </ListItem>
    )

    return (
      <Fragment>
        {
          this.props.toolTip
          ? (
              <Tooltip title={this.props.toolTip} placement="right">
                {listItem}
              </Tooltip>
            )
          : listItem
        }
      </Fragment>
    )
  }
}

ListButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.object,
  displayText: PropTypes.string,
  style: PropTypes.object,
  inset: PropTypes.bool,
  primaryTypographyProps: PropTypes.object,
  toolTip: PropTypes.string,
}
