
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
// import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
})

/**
 * Snackbar notification components. Only one is needed. Notifications are
 * received via props and queued in component state. Implementation courtesy:
 * https://github.com/mui-org/material-ui/blob/master/docs/src/pages/demos/snackbars/ConsecutiveSnackbars.js
 *
 * @extends {Component}
 */
class AppSnackbar extends Component {

  queue = []

  state = {
    open: false,
    messageInfo: {},
  }

  addMessage = message => {

    if (!message) return

    this.queue.push({
      message,
      key: new Date().getTime(),
    })

    if (this.state.open) {
      // immediately begin dismissing current message
      // to start showing new one
      this.setState({ open: false })
    } else {
      this.processQueue()
    }
  }

  processQueue = () => {

    if (this.queue.length > 0) {
      this.setState({
        messageInfo: this.queue.shift(),
        open: true,
      })
    }
  }

  handleClose = (event, reason) => {

    if (reason === 'clickaway') {
      return
    }
    this.setState({ open: false })
  }

  handleExited = () => {
    this.processQueue()
  }

  componentDidUpdate (prevProps) {

    if (
      this.props.message &&
      this.props.message.length > 0 &&
      prevProps.message !== this.props.message
    ) {
      this.addMessage(this.props.message)
    }
  }

  render () {

    const { classes } = this.props
    const { message, key } = this.state.messageInfo

    return (
      <div>
        <Snackbar
          key={key}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={this.state.open}
          autoHideDuration={this.props.duration}
          onClose={this.handleClose}
          onExited={this.handleExited}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{message}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    )
  }
}

AppSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
  duration: PropTypes.number.isRequired,
  message: PropTypes.string,
}

export default withStyles(styles)(AppSnackbar)
