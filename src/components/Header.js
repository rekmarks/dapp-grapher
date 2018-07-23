
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

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
    // console.log('Header render', this.props.version)
    return (
      <div>
        <header className="Header">
          <h1 className="Header-title">Dapp Grapher</h1>
          <div className = "Header-items">
            <div>
              <p className="Header-info">
                { this.props.web3Injected
                  ? 'Logged in with MetaMask'
                  : 'Please log in with MetaMask'
                }
              </p>
              <NavLink
                className="Header-nav"
                activeClassName="Header-active-nav"
                to="/dapp-graph" >
                Graph
                </NavLink>
              {' '}
              <NavLink
                className="Header-nav"
                activeClassName="Header-active-nav"
                to="/contract-form" >
                Form
              </NavLink>
              <br/>
              <a className="Header-nav" href={this.state.storageHref} download="state.json">
                Download State
              </a>
            </div>
          </div>
        </header>
      </div>
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
