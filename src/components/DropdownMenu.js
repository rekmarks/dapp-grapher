
/**
 * Courtesy:
 * https://github.com/mui-org/material-ui/tree/master/docs/src/pages/demos/menus/SimpleMenu.js
 */

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

class DropdownMenu extends Component {

  state = {
    anchorEl: null,
  }

  handleOpen = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = event => {
    this.setState({ anchorEl: null })
    this.props.selectAction(event.target.dataset.itemid) // HTML data attribute access
  }

  handleSelect = id => {
    console.log(id)
    this.handleClose()
  }

  getMenuItems = () => {

    return this.props.menuItemData.map(x => {
      return (
        <MenuItem
          onClick={this.handleClose}
          data-itemid={x.id} // HTML data attribute because MenuItem doesn't accept non-DOM element props
          key={x.id}
        >
          {x.name}
        </MenuItem>
      )
    })
  }

  render () {

    const { anchorEl } = this.state

    return (
      <div>
        <Button
          aria-owns={anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleOpen}
        >
          {this.props.menuTitle}
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {this.getMenuItems()}
        </Menu>
      </div>
    )
  }
}

DropdownMenu.propTypes = {
  menuTitle: PropTypes.string,
  menuItemData: PropTypes.array,
  selectAction: PropTypes.func,
}

export default DropdownMenu
