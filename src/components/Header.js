import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

class Header extends Component {
  render () {
    // console.log(this.props)
    return (
      <div>
        <header className="Header">
          <h1 className="Header-title">Dapp Grapher</h1>
          <p className="Header-info">Lorem Ipsum</p>
        </header>
      </div>
    )
  }
}

Header.propTypes = {
  web3: PropTypes.object,
}

export default Header
