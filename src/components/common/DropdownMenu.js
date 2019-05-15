
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
})

/**
 * Simple dropdown menu, courtesy:
 * https://github.com/mui-org/material-ui/tree/master/docs/src/pages/demos/menus/SimpleMenu.js
 *
 * @extends {Component}
 */
class DropdownMenu extends Component {

  button = null

  state = {
    anchorEl: null,
    selectedIndex: null,
  }

  handleOpen = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = event => {
    this.setState({ anchorEl: null })
  }

  handleSelect = (event, index) => {

    if (this.props.selectAction) {
      this.props.selectAction(event.target.dataset.itemid)
    }
    this.setState({ selectedIndex: index, anchorEl: null })
  }

  getMenuItems = () => {

    return this.props.menuItemData.map((item, index) => {
      return (
        <MenuItem
          onClick={event => this.handleSelect(event, index)}
          // data-itemid is a HTML data attribute because MenuItem doesn't
          // accept non-DOM element props
          data-itemid={item.id}
          key={item.id}
          selected={index === this.state.selectedIndex}
        >
          {item.name}
        </MenuItem>
      )
    })
  }

  render () {

    const { anchorEl } = this.state
    const items = this.props.menuItemData

    return (
      <div className={this.props.classes.root}>
        <List>
          <ListItem
            button
            aria-haspopup="true"
            aria-controls="lock-menu"
            aria-label={this.props.menuTitle}
            onClick={this.handleOpen}
          >
            <ListItemText
              primary={this.props.menuTitle}
              secondary={
                this.state.selectedIndex !== null
                ? items[this.state.selectedIndex].name
                : 'Please select a function' // TODO: turn into prop
              }
            />
          </ListItem>
        </List>
        <Menu
          id="lock-menu"
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

// className={this.props.classes.menu}

DropdownMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  menuTitle: PropTypes.string.isRequired,
  menuItemData: PropTypes.array.isRequired,
  selectAction: PropTypes.func,
}

export default withStyles(styles)(DropdownMenu)
