
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

import './style/Header.css'

class Header extends Component {
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
                exact to="/" >
                Home
              </NavLink>
              {' '}
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
}

export default Header
