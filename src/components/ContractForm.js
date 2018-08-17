
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import DropdownMenu from './DropdownMenu'
import { contractGraphTypes } from '../graphing/parseContract'

import './style/ContractForm.css'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textField: {
    // marginLeft: theme.spacing.unit,
    // marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },
})

class ContractForm extends Component {

  state = {
    fieldValues: {},
  }

  render () {

    console.log('ContractForm render')

    return (
      <div className="ContractForm-formContainer">
        {this.getFunctionForm()}
      </div>
    )
  }

  handleInputChange = id => event => {

    const target = event.target
    // const value = target.type === 'checkbox' ? target.checked : target.value
    // TODO: handle checkboxes and radio buttons

    this.setState({
      fieldValues: {
        ...this.state.fieldValues,
        [id]: target.value,
      },
    })
  }

  handleFunctionSubmit = metaData => event => {

    event.preventDefault()

    this.props.callInstance(
      this.props.contractAddress,
      metaData.abiName,
      metaData.paramOrder.length > 0
      ? metaData.paramOrder.map(id => {
          return this.state.fieldValues[id]
        })
      : null
    )
  }

  handleConstructorSubmit = metaData => event => {

    event.preventDefault()

    this.props.deploy(
      this.props.contractName,
      metaData.paramOrder.map(id => {
        return this.state.fieldValues[id]
      })
    )
    this.props.closeContractForm()
  }

  getFunctionForm = () => {

    let formData; let submitHandler; let functionCall = false

    switch (this.props.graphType) {

      case contractGraphTypes._constructor:

        submitHandler = this.handleConstructorSubmit
        formData = this.getFunctionFormFields()

        break

      case contractGraphTypes.functions:

        functionCall = true

        if (this.props.selectedContractFunction) {

          formData = this.getFunctionFormFields()
          submitHandler = this.handleFunctionSubmit
        }

        break

      default:
        throw new Error('unhandled graph type')
    }

    return (
      <Fragment>
        {
          functionCall
          ? <DropdownMenu
            menuItemData={getFunctionIds(this.props.nodes)}
            menuTitle={this.props.contractName}
            selectAction={this.props.selectContractFunction} />
          : null
        }
        {
          formData
          ?
            (
              <form noValidate autoComplete="off"
                className={this.props.classes.container}
                onSubmit={submitHandler(formData.metaData)}
              >
                <div>
                  {formData.fields}
                </div>
                <div>
                  <Button variant="contained" type="submit" >
                    {functionCall ? 'Call Function' : 'Deploy'}
                  </Button>
                </div>
              </form>
            )
          : null
        }
      </Fragment>
    )
  }

  getFunctionFormFields = () => {

    const functionId = this.props.selectedContractFunction
    const functionNodes = []

    if (!functionId) { // all nodes belong to function

      Object.values(this.props.nodes).forEach(node => {
        functionNodes.push(node)
      })
    } else { // only certain nodes belong to function

      Object.values(this.props.nodes).forEach(node => {
        if (node.id === functionId || node.parent === functionId) {
          functionNodes.push(node)
        }
      })
    }

    const metaData = {
      params: {},
      paramOrder: [],
    }
    const fields = []

    Object.values(functionNodes).forEach(node => {

      if (node.type === 'contract' || node.type === 'function') {

        metaData.title = node.displayName
        metaData.abiName = node.abiName

      } else if (node.type === 'parameter') {

        const fieldType = parseSolidityType(node.abiType)

        metaData.params[node.id] = {
          id: node.id,
          abiName: node.abiName,
          paramOrder: node.paramOrder,
        }
        metaData.paramOrder.push(node.id)

        switch (fieldType) {

          // case 'string':
          default:
            fields.push(
              <TextField
                key={node.id}
                id={node.id}
                label={node.displayName}
                className={this.props.classes.textField}
                value={this.state.fieldValues[node.id] ? this.state.fieldValues[node.id] : ''}
                onChange={this.handleInputChange(node.id)}
                margin="normal"
              />
            )
        }
      } else {
        console.warn('ContractForm: ignoring unknown node type: ' + node.type)
      }
    })

    fields.sort((a, b) => {
      return metaData.params[a.props.id].paramOrder - metaData.params[b.props.id].paramOrder
    })
    metaData.paramOrder.sort((a, b) => {
      return metaData.params[a].paramOrder - metaData.params[b].paramOrder
    })

    return {metaData, fields}
  }
}

export default withStyles(styles)(ContractForm)

ContractForm.propTypes = {
  classes: PropTypes.object.isRequired,
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

/**
 * HELPERS
 */

function getFunctionIds (nodes) {

  const functions = []
  Object.values(nodes).forEach(node => {
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
 * Takes a Solidity function parameter type and ouputs the appropriate
 * type for a react-jsonschema-form field
 * @param  {string} parameterType a Solidity function parameter
 * @return {string}               the corresponding form field type
 */
function parseSolidityType (parameterType) {

  // TODO:
  // - better array and address handling
  // - other missing specific datatype cases

  if (parameterType.slice(-2) === '[]') { // array
    return 'string'
  } else if (parameterType === 'bool') {
    return 'boolean'
  } else if (
    parameterType.slice(0, 4) === 'uint' ||
    parameterType.slice(0, 3) === 'int'
  ) {
      return 'integer'
  } else if (
    parameterType.slice(0, 6) === 'fixed' ||
    parameterType.slice(0, 7) === 'ufixed'
  ) {
      return 'number'
  } else {
    return 'string'
  }
}
