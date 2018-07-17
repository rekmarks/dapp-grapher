import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

class Header extends Component {
  render () {
    // console.log('Header render', this.props.version)
    return (
      <div>
        <header className="Header">
          <h1 className="Header-title">Dapp Grapher</h1>
          <p className="Header-info">{this.props.version}</p>
        </header>
      </div>
    )
  }
}

Header.propTypes = {
  version: PropTypes.string,
}

export default Header
