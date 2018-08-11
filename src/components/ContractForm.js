
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Form from 'react-jsonschema-form'

import DropdownMenu from './DropdownMenu'
import { contractGraphTypes } from '../graphing/parseContract'

import './style/ContractForm.css'

// react-jsonschema-form logger
const log = (type) => console.log.bind(console, type)

export default class ContractForm extends Component {

  getConstructorForm = () => {

    const formData = generateFunctionForm(this.props.nodes)

    return (
      <Form
      className="ContractForm-form"
      schema={formData.schema}
      uiSchema={formData.uiSchema}
      onChange={log('changed')}
      onSubmit={
        formData => {
          this.props.deploy(
            formData.schema.title,
            Object.values(formData.formData)
          )
          this.props.closeContractForm()
        }
      }
      onError={log('errors')} />
    )
  }

  getFunctionsForm = () => {

    const formComponents = [(
      <DropdownMenu
        key="DropdownMenu"
        menuItemData={getFunctionIds(this.props.nodes)}
        menuTitle={this.props.contractName}
        selectAction={this.props.selectContractFunction} />
    )]

    if (this.props.selectedContractFunction) {

      const formData = generateFunctionForm(
          this.props.nodes,
          this.props.selectedContractFunction
      )

      formComponents.push(
        <Form
        key="ContractForm-form"
        className="ContractForm-form"
        schema={formData.schema}
        uiSchema={formData.uiSchema}
        onChange={log('changed')}
        onSubmit={formData => {

            const params = [
              this.props.contractAddress,
              formData.schema.abiName,
            ]

            if (Object.keys(formData.formData).length > 0) {
              params.push(Object.values(formData.formData))
            }
            // debugger
            this.props.callInstance(...params)
            // console.log(formData)
            // this.props.closeContractForm()
          }
        }
        onError={log('errors')} />
      )
    }

    return formComponents
  }

  render () {

    let formComponents = null

    switch (this.props.graphType) {

      case contractGraphTypes._constructor:
        formComponents = this.getConstructorForm()
        break

      case contractGraphTypes.functions:
        formComponents = this.getFunctionsForm()
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
  contractAddress: PropTypes.string,
  callInstance: PropTypes.func,
  contractName: PropTypes.string,
  graphType: PropTypes.string,
  nodes: PropTypes.object,
  deploy: PropTypes.func,
  closeContractForm: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
}

/* helper functions */

function getFunctionIds (nodes) {

  const functions = []
  Object.values(nodes).forEach( node => {
    if (node.type === 'function') {
      functions.push({
        id: node.id,
        name: node.displayName,
      })
    }
  })

  functions.sort((a, b) => {
    if (a.name === b.name) return 0 // sanity
    return a.name < b.name ? -1 : 1
  })

  return functions
}

/**
 * Takes the nodes of a smart contract function graph and returns the schema
 * and uiSchema for a react-jsonschema-form
 * @param  {object} nodes   the nodes to turn into a form
 * @return {object}         an object with attributes schema and uiSchema
 */
function generateFunctionForm (nodes, functionId = null) {

  const functionNodes = []

  if (!functionId) { // all nodes belong to function

    Object.values(nodes).forEach(node => {
      functionNodes.push(node)
    })
  } else { // only certain nodes belong to function

    Object.values(nodes).forEach(node => {
      if (node.id === functionId || node.parent === functionId) {
        functionNodes.push(node)
      }
    })
  }

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

  functionNodes.forEach(node => {

    // contract name = form title
    if (node.type === 'contract' || node.type === 'function') {

      schema.title = node.displayName
      schema.abiName = node.abiName

    } else {

      // parse node data to create corresponding field object
      const field = {
        type: parseSolidityType(node.abiType),
        title: node.displayName,
        parameterName: node.abiName,
      }

      schema.properties[field.parameterName] = field
      schema.required.push(field.parameterName)

      // order is retained from ABI and is correct for the web3.eth call
      uiSchema['ui:order'].push(field.parameterName)
      uiSchema[field.parameterName] = {
        'ui:placeholder': node.abiType + ':' + node.abiName,
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
