import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
// import Web3 from 'web3'

import Grapher from './Grapher'
import Header from './Header'
import './App.css'

import { getWeb3 } from '../redux/web3'

class App extends Component {

  constructor (props) {
    super(props)
    this.props.getWeb3()
  }

  render () {
    console.log('App render', this.props)
    return (
      <div className="App">
        <Header version={this.props.web3 ? this.props.web3.version : 'nil'}/>
        <Grapher />
      </div>
    )
  }
}

App.propTypes = {
  web3: PropTypes.object,
  getWeb3: PropTypes.function,
}

const mapStateToProps = state => {
  console.log('mapStateToProps', state)
  return {
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getWeb3: () => dispatch(getWeb3()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

// export default connect(
//   state => ({
//     web3: state.web3,
//   }),
//   dispatch => ({
//     getWeb3: () => dispatch(getWeb3Action()),
//   })
// )(App)
