import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'

import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ListItemIcon from '@material-ui/core/ListItemIcon'

export default class NestedList extends Component {

  state = { open: false }

  handleParentClick = () => {
    this.setState(state => ({ open: !state.open }))
  }

  componentDidMount () {
    if (this.props.isOpen) this.setState({ open: true })
  }

  render () {
    return (
      <Fragment>
        <ListItem button
          disabled={this.props.disabled || !this.props.children}
          onClick={this.handleParentClick}
          style={
            this.props.buttonPadding
            ? { paddingLeft: this.props.buttonPadding }
            : {}
          }
        >
          {
            this.props.icon
            ? (
                <ListItemIcon>
                  {this.props.icon}
                </ListItemIcon>
              )
            : ''
          }
          <ListItemText
            inset
            primary={this.props.displayText} />
          {
            this.props.disabled || !this.props.children
            ? ''
            : this.state.open ? <ExpandLessIcon /> : <ExpandMoreIcon />
          }
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {this.props.children}
          </List>
        </Collapse>
      </Fragment>
    )
  }
}

NestedList.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.element)),
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
  disabled: PropTypes.bool,
  icon: PropTypes.object,
  displayText: PropTypes.string.isRequired,
  buttonPadding: PropTypes.number,
  isOpen: PropTypes.bool,
}
