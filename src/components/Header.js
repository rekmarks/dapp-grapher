
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'

export default class Header extends Component {

  render () {

    return (
      <Fragment>
        <div className = "Header-items">
          <Typography variant="subheading" color="inherit">
            { this.props.web3Injected
              ? 'Logged in with MetaMask'
              : 'Please log in with MetaMask'
            }
          </Typography>
        </div>
      </Fragment>
    )
  }
}

Header.propTypes = {
  web3Injected: PropTypes.bool,
  setCanvas: PropTypes.func,
  canvasComponent: PropTypes.string,
}
