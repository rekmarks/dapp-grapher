
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import DropdownMenu from './common/DropdownMenu'
import { contractGraphTypes } from '../graphing/graphGenerator'

/**
 * TODO
 * There's a significant amount of application logic in this component that
 * should be moved to redux thunks if possible
 */

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

  componentDidMount () {

    // dapp field values are stored in state, but not individual contracts
    if (
      this.props.selectedGraph.type === 'dapp' &&
      Object.keys(this.props.fieldValues).length > 0
    ) {
      this.setState({ fieldValues: this.props.fieldValues })
    }
  }

  componentWillUnmount () {

    // dapp field values are stored in state, but not individual contracts
    if (
      this.props.selectedGraph.type === 'dapp' &&
      Object.keys(this.state.fieldValues).length > 0
    ) {
      this.props.storeFieldValues(this.state.fieldValues)
    }
  }

  render () {

    const { classes } = this.props

    return (
      <Fragment>
        <Typography
          className={classes.nested}
          variant="title"
          id="modal-title"
        >
          {this.props.heading}
        </Typography>
        <Typography
          className={classes.nested}
          id="simple-modal-description"
          variant="subheading"
        >
          {this.getSubheading()}
        </Typography>
        {this.getFunctionForm()}
      </Fragment>
    )
  }

  getSubheading = () => {

    let type

    if (this.props.selectedContractFunction) {
      type =
        this.props.selectedGraph.elements
        .nodes[this.props.selectedContractFunction].type
    } else {
      type = this.props.selectedGraph.type
    }

    switch (type) {

      case contractGraphTypes._constructor:
        return 'Constructor'
      default:
        return 'Deployed'
    }
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
    this.props.closeContractForm()
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

    const wipDeployment = {
      ...(
        this.props.wipDappDeployment
        ? this.props.wipDappDeployment
        : {}
      ),
    }

    // TODO: application logic
    wipDeployment[metaData.id] = {
      nodeId: metaData.id,
      contractName: metaData.abiName,
      deploymentOrder: this.props.dappTemplate.contracts[metaData.id].deploymentOrder,
      params: {
        ...metaData.params,
      },
      outputs: {
        ...metaData.outputs,
      },
    }

    Object.values(wipDeployment[metaData.id].params).forEach(param => {

      if (param.source) { // this parameter is an edge target

        if (param.sourceParent === 'account') {
          param.value = this.props.account
        } else console.log('ignoring param source', param.source)
      } else {
        param.value = this.state.fieldValues[param.id]
      }
    })

    Object.values(wipDeployment[metaData.id].outputs).forEach(output => {

      if (output.target) { // this parameter is an edge source

        if (!wipDeployment[metaData.id].childParams) {
          wipDeployment[metaData.id].childParams = []
        }

        wipDeployment[metaData.id].childParams.push({
          type: 'address',
          paramId: output.target,
          contractId: output.targetParent,
          deploymentOrder: this.props.dappTemplate.contracts[output.targetParent].deploymentOrder,
        })
      }
    })

    this.props.updateWipDappDeployment(wipDeployment)
    this.props.closeContractForm()
  }

  getFunctionForm = () => {

    const { classes } = this.props
    const nodes = this.props.selectedGraph.elements.nodes
    const graphType = this.props.selectedGraph.type
    const selectedNodeId = this.props.selectedContractFunction
    const selectedNode = nodes[selectedNodeId]

    const formData = this.getFunctionFormData()

    let submitHandler; let functionCall = false

    switch (graphType) {

      case contractGraphTypes._constructor:

        submitHandler = this.handleConstructorSubmit

        break

      case contractGraphTypes.functions:

        functionCall = true

        // here, a function is only selected if selected by user from
        // DropdownMenu component in form (see below)
        if (this.props.selectedContractFunction) {


          submitHandler = this.handleFunctionSubmit
        }

        break

      case 'dapp':

        // in the case of a dapp, a function id is selected in Grapher,
        // by an event handler in the Joint paper and passed to
        // this.props.selectedContractFunction

        if (selectedNode.type === contractGraphTypes.functions) {
          functionCall = true
        }

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
                <div className={classes.nested}>
                  {formData.fields}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    className={classes.button}
                    variant="contained"
                    type="submit"
                  >
                    {
                      graphType === 'dapp'
                      ? 'Save Inputs'
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

  getFunctionFormData = () => {

    const nodes = this.props.selectedGraph.elements.nodes
    const edges = this.props.selectedGraph.elements.edges
    const functionId = this.props.selectedContractFunction
    const functionNodes = []

    Object.values(nodes).forEach(node => {
      if (node.id === functionId || node.parent === functionId) {
        functionNodes.push(node)
      }
    })

    const metaData = {
      params: {},
      outputs: {},
      paramOrder: [],
    }
    const fields = []

    functionNodes.forEach(node => {

      if (
        Object.values(contractGraphTypes).includes(node.type) ||
        node.type === 'function'
      ) {

        metaData.title = node.displayName
        metaData.abiName = node.abiName
        metaData.id = node.id

      } else if (node.type === 'parameter') {

        const fieldType = parseSolidityType(node.abiType)

        const paramData = {
          id: node.id,
          abiName: node.abiName,
          abiType: node.abiType,
          paramOrder: node.paramOrder,
          parentForm: node.parent,
        }

        Object.values(edges).forEach(edge => {

          if (edge.target === node.id) {
            paramData.edge = edge.id
            paramData.source = edge.source
            paramData.sourceParent = edge.sourceParent
          }
        })

        metaData.params[node.id] = paramData

        metaData.paramOrder.push(node.id)

        switch (fieldType) {

          // TODO: handle different parameter types
          // case 'string':
          default:
            fields.push(
              <TextField
                key={node.id}
                id={node.id}
                label={node.displayName}
                className={this.props.classes.textField}
                value={
                  paramData.source
                  ? this.getSourcedFieldValue(edges[paramData.edge])
                  : this.state.fieldValues[node.id]
                    ? this.state.fieldValues[node.id]
                    : ''
                }
                disabled={Boolean(paramData.source)}
                onChange={this.handleInputChange(node.id)}
                margin="normal"
              />
            )

            break
        }
      } else if (node.type === 'output') {

        Object.values(edges).forEach(edge => {

          if (edge.source === node.id) {
            metaData.outputs[edge.id] = {
              edge: edge.id,
              target: edge.target,
              targetParent: edge.targetParent,
            }
          }
        })
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

  getSourcedFieldValue = (edge) => {

    // TODO: handle remaining possible value sources
    if (edge.sourceParent === 'account') {
      return 'Current Account Address'
    }
    if (edge.sourceAbiType === 'address') {
      return 'Deployed Contract Address'
    } else throw new Error('unknown field value')
  }
}

export default withStyles(styles)(ContractForm)

ContractForm.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.string,
  contractAddress: PropTypes.string,
  callInstance: PropTypes.func,
  deployContract: PropTypes.func,
  closeContractForm: PropTypes.func,
  selectContractFunction: PropTypes.func,
  selectedContractFunction: PropTypes.string,
  heading: PropTypes.string,
  selectedGraph: PropTypes.object,
  updateWipDappDeployment: PropTypes.func,
  dappTemplate: PropTypes.object,
  wipDappDeployment: PropTypes.object,
  fieldValues: PropTypes.object,
  storeFieldValues: PropTypes.func,
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
