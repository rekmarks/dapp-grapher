
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paper: {
    position: 'absolute',
    flex: 1,
    width: '50%',
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'space-between',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
})

class AppModal extends Component {

  render () {

    const { classes } = this.props

    return (
      <div>
        <Modal
          className={classes.root}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.props.open}
          onClose={this.props.onClose}
        >
          <div className={classes.paper}>
            <Typography variant="title" id="modal-title">
              {this.props.heading ? this.props.heading : ''}
            </Typography>
            {
              this.props.subHeading
              ?
                (
                  <Typography variant="subheading" id="simple-modal-description">
                    {this.props.subHeading}
                  </Typography>
                )
              : ''
            }
            {this.props.children}
          </div>
        </Modal>
      </div>
    )
  }
}

AppModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.object,
  heading: PropTypes.string,
  subHeading: PropTypes.string,
}

export default withStyles(styles)(AppModal)
