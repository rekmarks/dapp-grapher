
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import './style/ContractForm.css'

export default class ContractForm extends Component {

  constructor (props) {
    super(props)
    this.state = {form: null}
  }

  componentDidMount () {
    this.setState((prevProps, props) => {
      if (prevProps.contractName !== props.contractName) {
        return { form: generateForm(props.nodes)}
      }
      return {}
    })
  }

  render () {

    console.log('rendering')

    // https://stackoverflow.com/questions/37822530/dynamically-generating-jsx-in-react#37822748
    // https://jsfiddle.net/yc3qcd0u/45/

    return (
      <div className="formContainer">
        {this.state.form || ''}
      </div>
    )
  }
}

ContractForm.propTypes = {
  nodes: PropTypes.array,
  contractName: PropTypes.string,
}

function generateForm (nodes) {

  nodes.forEach(node => {
    console.log(node.data)
  })

  return (
    <p className="temp"> I am a form </p>
  )
}
