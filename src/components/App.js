import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
// import Web3 from 'web3'

import Grapher from './Grapher'
import Header from './Header'
import './App.css'

import { getGetWeb3Action } from '../redux/web3'

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
  }

  render () {
    // console.log(this.props)
    return (
      <div className="App">
        <Header web3={this.props.web3}/>
        <Grapher />
      </div>
    )
  }
}

App.propTypes = {
  web3: PropTypes.object,
  getWeb3: PropTypes.function,
}

export default connect(
  state => ({
    web3: state.web3,
  }),
  dispatch => ({
    getWeb3: () => dispatch(getGetWeb3Action()),
  })
)(App)
