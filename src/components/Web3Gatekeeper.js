
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import EthereumIcon from './common/EthereumIcon'

/**
 * Simple EIP1102-compliance solution that prevents <App/> from rendering
 * until user enables web3.
 *
 * TODO: this does not handle account changes after <App/> is rendered
 *
 * @extends {Component}
 */
export default class Web3Gatekeeper extends Component {

  constructor (props) {

    super(props)
    this.state = { web3Enabled: false, enableFailed: false }
  }

  async componentDidMount () {

    if (!window.ethereum || !window.ethereum.isMetaMask) return

    let accounts

    try {
      accounts = await window.ethereum.enable()
    } catch (error) {
      console.log(error)
      this.setState({ enableFailed: true })
      return
    }

    // since assuming MetaMask, exactly one account should be returned
    if (accounts.length !== 1) {
      console.warn('More than one account found.', accounts)
    }

    this.setState({ web3Enabled: true })
  }

  render () {

    if (!this.state.web3Enabled) {

      return (
        <EthereumIcon message={
            this.state.enableFailed
            ? 'Please Download MetaMask'
            : 'Waiting for Web3...'
          }
        />
      )
    }

    return this.props.children
  }
}

Web3Gatekeeper.propTypes = {
  children: PropTypes.object,
}
