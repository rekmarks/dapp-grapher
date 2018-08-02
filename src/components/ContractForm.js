
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Form from 'react-jsonschema-form'

import { contractGraphTypes } from '../graphing/contractParser'

import './style/ContractForm.css'

// react-jsonschema-form logger
const log = (type) => console.log.bind(console, type)

export default class ContractForm extends Component {

  render () {

    let formComponents = null; let formData

    switch (this.props.graphType) {

      case contractGraphTypes.completeAbi:

        formData = generateForm(this.props.nodes, this.props.graphType)

        formComponents = (
          <Form
          className="ContractForm-form"
          schema={formData.schema}
          uiSchema={formData.uiSchema}
          onChange={log('changed')}
          onSubmit={
            (formData) => {
              this.props.deploy(
                formData.schema.title,
                Object.values(formData.formData)
              )
              this.props.closeContractForm()
            }
          }
          onError={log('errors')} />
        )
        break

      case contractGraphTypes._constructor:

        formData = generateForm(this.props.nodes, this.props.graphType)

        formComponents = (
          <Form
          className="ContractForm-form"
          schema={formData.schema}
          uiSchema={formData.uiSchema}
          onChange={log('changed')}
          onSubmit={
            (formData) => {
              this.props.deploy(
                formData.schema.title,
                Object.values(formData.formData)
              )
              this.props.closeContractForm()
            }
          }
          onError={log('errors')} />
        )
        break

      default:
        break
    }

    return (
      <div className="ContractForm-formContainer">
        {formComponents}
      </div>
    )
  }
}

ContractForm.propTypes = {
  contractName: PropTypes.string,
  graphType: PropTypes.string,
  nodes: PropTypes.array,
  deploy: PropTypes.func,
  closeContractForm: PropTypes.func,
}

/* helper functions */

/**
 * Takes the nodes of a smart contract graph and returns the schema
 * and uiSchema for a react-jsonschema-form
 * @param  {object} nodes the nodes to turn into a form
 * @return {object}       an object with attributes schema and uiSchema
 */
function generateForm (nodes, graphType) {

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
    'ui:order': [], // parameter fields will be pushed in their correct order
  }

  nodes.forEach(node => {

    // contract name = form title
    if (node.data.type === 'contract') {

      schema.title = node.data.nodeName

    } else {

      if (graphType === contractGraphTypes.completeAbi &&
        node.data.type !== 'function') return

      // parse node data to create corresponding field object
      const field = {
        type: parseSolidityType(node.data.abi.type),
        title: node.data.nodeName,
        parameterName: node.data.abi.name,
      }

      schema.properties[field.parameterName] = field
      schema.required.push(field.parameterName)

      uiSchema['ui:order'].push(field.parameterName)
      uiSchema[field.parameterName] = {
        'ui:placeholder': node.data.abi.type + ':' + node.data.abi.name,
      }
    }
  })

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

    case parameterType.slice(-2) === '[]': // array
      return 'string'

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
