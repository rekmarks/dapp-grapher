
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
// import classNames from 'classnames'

import './style/Header.css'

export default class Header extends Component {

  constructor (props) {
    super(props)
    this.state = { storageHref: getStorageHref()}
  }

  componentDidUpdate (prevProps) {

    if (prevProps.contractInstances !== this.props.contractInstances) {
      this.setState({ storageHref: getStorageHref()})
    }
  }

  render () {

    return (
      <Fragment>
        <div className = "Header-items">
          <div className="Header-info">
            <p className="Header-info-label">
              { this.props.web3Injected
                ? 'Logged in with MetaMask'
                : 'Please log in with MetaMask'
              }
            </p>
          </div>
          <div className="Header-links">
            <a className="Header-link" href={this.state.storageHref} download="dapp-grapher-state.json">
              Download State
            </a>
          </div>
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

/**
 * encodes persisted storage as an href for downloading
 * @return {string} href attribute for an HTML anchor
 */
function getStorageHref () {
 return 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('dapp-grapher'))
}
