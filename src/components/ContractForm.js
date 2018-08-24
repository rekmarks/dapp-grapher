
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import DropdownMenu from './common/DropdownMenu'
import { contractGraphTypes } from '../graphing/graphGenerator'

import './style/ContractForm.css'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  textField: {
    marginRight: theme.spacing.unit * 2,
    width: 200,
  },
  button: {
    marginRight: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 4,
  },
  nested: {
    marginLeft: 24, // to match DropDown menu
  },
})

class ContractForm extends Component {

  state = {
    fieldValues: {},
  }

  render () {

    const { classes } = this.props

    return (
      <div className="ContractForm-formContainer">
        <Typography
          className={classes.nested}
          variant="title"
          id="modal-title"
        >
          {this.props.heading ? this.props.heading : ''}
        </Typography>
        {
          this.props.subHeading
          ?
            (
              <Typography variant="subheading" id="simple-modal-description">
                {this.props.subHeading}
              </Typography>
            )
          : ''
        }
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

    this.setState({ fieldValues: {} })
  }

  handleConstructorSubmit = metaData => event => {

    event.preventDefault()

    this.props.deployContract(
      this.props.selectedGraph.name,
      metaData.paramOrder.map(id => {
        return this.state.fieldValues[id]
      })
    )
    this.props.closeContractForm()
  }

  handleDappFunctionSubmit = metaData => event => {

    event.preventDefault()

    this.props.updateWipDappDeployment(
      // TODO: 8-24
    )
    this.props.closeContractForm()
  }

  getFunctionForm = () => {

    const { classes } = this.props
    const nodes = this.props.selectedGraph.elements.nodes
    const graphType = this.props.selectedGraph.type
    const selectedNodeId = this.props.selectedContractFunction
    const selectedNode = nodes[selectedNodeId]

    let formData; let submitHandler; let functionCall = false

    switch (graphType) {

      case contractGraphTypes._constructor:

        formData = this.getFunctionFormFields()
        submitHandler = this.handleConstructorSubmit

        break

      case contractGraphTypes.functions:

        functionCall = true

        // here, a function is only selected if selected by user from
        // DropdownMenu component in form (see below)
        if (this.props.selectedContractFunction) {

          formData = this.getFunctionFormFields()
          submitHandler = this.handleFunctionSubmit
        }

        break

      case 'dapp':

        // in the case of a dapp, a function id is selected in Grapher,
        // by an event handler in the Joint paper

        if (selectedNode.type === contractGraphTypes.functions) {
          functionCall = true
        }

        formData = this.getFunctionFormFields()
        submitHandler = this.handleDappFunctionSubmit

        break

      default:
        throw new Error('unhandled graph type')
    }

    return (
      <Fragment>
        {
          functionCall
          ? <DropdownMenu
              classes={{ root: classes.root }}
              menuItemData={getFunctionAndConstructorIds(nodes)}
              menuTitle="Functions"
              selectAction={this.props.selectContractFunction} />
          : null
        }
        {
          formData
          ?
            (
              <form
                className={classes.container}
                onSubmit={submitHandler(formData.metaData)}
              >
                <div className="ContractForm-fields">
                  {formData.fields}
                </div>
                <div className="ContractForm-button">
                  <Button
                    className={classes.button}
                    variant="contained"
                    type="submit"
                  >
                    {
                      graphType === 'dapp'
                      ? 'Submit'
                      : functionCall
                        ? 'Call Function'
                        : 'Deploy'
                    }
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

    const nodes = this.props.selectedGraph.elements.nodes
    const edges = this.props.selectedGraph.elements.edges
    const graphType = this.props.selectedGraph.type
    const functionId = this.props.selectedContractFunction
    const functionNodes = []

    Object.values(nodes).forEach(node => {
      if (node.id === functionId || node.parent === functionId) {
        functionNodes.push(node)
      }
    })

    const metaData = {
      params: {},
      paramOrder: [],
    }
    const fields = []

    if (graphType === 'dapp' && Object.keys(edges).length > 0) {
      // TODO: 8-24
      // Need to figure out which field values are determined by the
      // graph and set them accordingly. This information is stored in
      // the edges.
    }

    functionNodes.forEach(node => {

      if (
        Object.values(contractGraphTypes).includes(node.type) ||
        node.type === 'function'
      ) {

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
      } else if (node.type === 'output') console.log('ContractForm ignoring output node') // TODO: change?
      else console.warn('ContractForm: ignoring unknown node type: ' + node.type)
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
  deployContract: PropTypes.func,
  closeContractForm: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
  heading: PropTypes.string,
  subHeading: PropTypes.string,
  selectedGraph: PropTypes.object,
  updateWipDappDeployment: PropTypes.func,
  selectedDappTemplate:PropTypes.object,
  wipDappDeployment:PropTypes.object,
}

/**
 * HELPERS
 */

function getFunctionAndConstructorIds (nodes) {

  const functions = []
  Object.values(nodes).forEach(node => {
    if (node.type === 'function' || node.type === 'constructor') {
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
