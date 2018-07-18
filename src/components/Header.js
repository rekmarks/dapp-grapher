import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './style/Header.css'

class Header extends Component {
  render () {
    // console.log('Header render', this.props.version)
    return (
      <div>
        <header className="Header">
          <h1 className="Header-title">Dapp Grapher</h1>
          <div className = "Header-items">
            <button
              onClick={this.props.setCanvas.bind(this, 'Grapher')}
              disabled={this.props.canvasComponent === 'Grapher'}
            >
              Graph
            </button>
            <button
              onClick={this.props.setCanvas.bind(this, 'ContractForm')}
              disabled={this.props.canvasComponent === 'ContractForm'}
            >
              Form
            </button>
            <p className="Header-info">
              { this.props.web3Injected
                ? 'Logged in with MetaMask'
                : 'Please log in with MetaMask'
              }
            </p>
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
