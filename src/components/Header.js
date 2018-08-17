
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
// import classNames from 'classnames'

import './style/Header.css'

export default class Header extends Component {

  render () {

    return (
      <Fragment>
        <div className = "Header-items">
          <p className="Header-info-label">
            { this.props.web3Injected
              ? 'Logged in with MetaMask'
              : 'Please log in with MetaMask'
            }
          </p>
        </div>
      </Fragment>
    )
  }
}

Header.propTypes = {
  web3Injected: PropTypes.bool,
  setCanvas: PropTypes.func,
  canvasComponent: PropTypes.string,
  contractInstances: PropTypes.object,
}
