
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Form from 'react-jsonschema-form'

import './style/ContractForm.css'

// react-jsonschema-form logger
const log = (type) => console.log.bind(console, type)

export default class ContractForm extends Component {

  constructor (props) {
    super(props)
    this.state = {formProps: null}
  }

  componentDidMount () {
    this.setState((prevProps, props) => {
      // TODO: this check fails because contracts don't have unique IDs
      if (prevProps.contractName !== props.contractName) {
        return { formProps: generateForm(props.nodes)}
      }
      return {}
    })
  }

  render () {

    // console.log('rendering')

    return (
      <div className="ContractForm-formContainer">
        { 
          this.state.formProps 
            ? <Form
                className="ContractForm-form"
                schema={this.state.formProps.schema}
                uiSchema={this.state.formProps.uiSchema}
                onChange={log('changed')}
                onSubmit={log('submitted')}
                onError={log('errors')} />
            : ''
        }
      </div>
    )
  }
}

ContractForm.propTypes = {
  nodes: PropTypes.array,
  contractName: PropTypes.string,
}

/* helper functions */
// TODO - move all of these operations out of here, probably

/**
 * Takes the nodes of a smart contract graph and returns the schema
 * and uiSchema for a react-jsonschema-form
 * @param  {object} nodes the nodes to turn into a form
 * @return {object}       an object with attributes schema and uiSchema
 */
function generateForm (nodes) {

  const schema = {
    title: null, // form title
    type: 'object', // top-level form type should be object
    required: [], // the required fields (will be all)
    properties: {
      // e.g.
      // title: {type: 'string', title: 'Title', default: 'A new task'},
    },
  }

  const uiSchema = {
    'ui:order': [],
  }

  nodes.forEach(node => {
    
    if (node.data.type === 'contract') {
      
      schema.title = node.data.nodeName
    
    } else {

      const field = {
        type: parseSolidityType(node.data.abi.type),
        title: node.data.nodeName,
        parameterName: node.data.abi.name,
      }
      schema.properties[field.parameterName] = field
      schema.required.push(field.parameterName)

      uiSchema['ui:order'].push(field.parameterName)
      uiSchema[field.parameterName] = {}
      uiSchema[field.parameterName]['ui:placeholder'] = 
        node.data.abi.type + ': ' + node.data.abi.name
    }
  })

  // will list fields alphabetically
  uiSchema['ui:order'].sort()

  return {schema, uiSchema}
}

/**
 * Takes a Solidity function parameter type and ouputs the appropriate 
 * type for a react-jsonschema-form field
 * @param  {string} parameterType a Solidity function parameter 
 * @return {string}               the corresponding form field type
 */
function parseSolidityType (parameterType) {

  // TODO: 
  // - better array and address handling
  // - other missing specific datatype cases 

  switch (parameterType) {

    case parameterType.slice(-2) === '[]':
      return 'string' // array

    case 'bool':
      return 'boolean'

    case 
      parameterType.slice(0, 4) === 'uint' ||
      parameterType.slice(0, 3) === 'int':
        
        return 'integer'

    case 
      parameterType.slice(0, 6) === 'fixed' ||
      parameterType.slice(0, 7) === 'ufixed':
        
        return 'number'

    default:
      return 'string'
  }
}
