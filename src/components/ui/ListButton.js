
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
}
