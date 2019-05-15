
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import DropdownMenu from './common/DropdownMenu'

import { graphTypes } from '../graphing/graphGenerator'
import { getDisplayAddress } from '../utils'

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

/**
 * Form for interacting with contracts, either individually or as part of dapp
 * templates when deploying.
 *
 * @extends {Component}
 */
class ContractForm extends Component {

  state = {
    fieldValues: {},
  }

  componentDidMount () {

    // dapp field values are stored in Redux state
    if (
      Object.values(graphTypes.dapp).includes(this.props.graph.type) &&
      Object.keys(this.props.fieldValues).length > 0
    ) {
      this.setState({ fieldValues: this.props.fieldValues })
    }
  }

  componentWillUnmount () {

    // dapp field values are stored in Redux state
    if (
      Object.values(graphTypes.dapp).includes(this.props.graph.type) &&
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
        {this.getSubheading()}
        {this.getFunctionForm()}
      </Fragment>
    )
  }

  /**
   * Determines and returns ContractForm subheading. If there is a
   * contractAddress prop, wraps Typography component in CopyToClipboard
   * component.
   *
   * @returns {jsx} the ContractForm's subheading
   */
  getSubheading = () => {

    let type

    if (this.props.selectedContractFunction) {
      type =
        this.props.graph.elements
        .nodes[this.props.selectedContractFunction].type
    } else {
      type = this.props.graph.type
    }

    const typography = (
      <Typography
          className={this.props.classes.nested}
          id="simple-modal-description"
          variant="subheading"
        >
        {
          this.props.contractAddress
          ? getDisplayAddress(this.props.contractAddress)
          : type === graphTypes.contract._constructor
            ? 'Constructor'
            : 'Deployed'
        }
      </Typography>
    )

    return (
      this.props.contractAddress
      ? <CopyToClipboard
          text={this.props.contractAddress}
          onCopy={this.handleCopy}
          style={{ cursor: 'pointer', flexShrink: 1 }}
        >
          {typography}
        </CopyToClipboard>
      : typography
    )
  }

  /**
   * Creates notification when contract address is copied to clipboard.
   */
  handleCopy = () => {
    this.props.addSnackbarNotification(
      'Contract address copied to clipboard!',
      2000
    )
  }

  /**
   * Stores input in component state.
   * TODO: Does not handle checkboxes or radio buttons.
   *
   * @param {string} id input field id
   */
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

  /**
   * Form submit handler.
   * Initiates web3 call to deployed contract when a contract function form is
   * submitted. Clears form fields and closes containing modal.
   *
   * @param {object} web3Data web3 data from form
   */
  handleFunctionSubmit = web3Data => event => {

    event.preventDefault()

    this.props.callInstance(
      this.props.contractAddress,
      web3Data.abiName,
      web3Data.paramOrder.length > 0 // if there are any function params
      ? web3Data.paramOrder.map(id => {
          return this.state.fieldValues[id]
        })
      : null
    )

    this.setState({ fieldValues: {} })
    this.props.closeContractForm()
  }

  /**
   * Form submit handler.
   * Initiates web3 call to deploy a contract when a contract constructor form
   * is submitted. Closes the containing modal without clearing form.
   *
   * @param {object} web3Data web3 data from form
   */
  handleConstructorSubmit = web3Data => event => {

    event.preventDefault()

    this.props.deployContract(
      this.props.graph.name,
      web3Data.paramOrder.map(id => {
        return this.state.fieldValues[id]
      })
    )
    this.props.closeContractForm()
  }

  /**
   * Uses form data to update the wipDappDeployment state object, which
   * defines the web3 calls made when a dapp is deployed.
   *
   * @param {object} web3Data web3 data from form
   */
  handleDappFunctionSubmit = web3Data => event => {

    event.preventDefault()

    const wipDeployment = {
      ...(
        this.props.wipDappDeployment
        ? this.props.wipDappDeployment
        : {}
      ),
    }

    // TODO: application logic, move to thunk
    wipDeployment[web3Data.id] = {
      nodeId: web3Data.id,
      contractName: web3Data.abiName,
      deploymentOrder:
        this.props.dappTemplate.contractNodes[web3Data.id].deploymentOrder,
      params: {
        ...web3Data.params,
      },
      outputs: {
        ...web3Data.outputs,
      },
    }

    // store field values in component state
    Object.values(wipDeployment[web3Data.id].params).forEach(param => {

      if (param.source) { // if this parameter is an edge target

        if (param.sourceParent === 'account') {
          param.value = this.props.account
        } else console.log('ignoring param source', param.source)
      } else {
        param.value = this.state.fieldValues[param.id]
      }
    })

    // store outputs of form's corresponding contract deployment in
    // wipDeployment
    Object.values(wipDeployment[web3Data.id].outputs).forEach(output => {

      // TODO? if other output types are added, this must handle them

      if (output.target) { // if this parameter is an edge source

        if (!wipDeployment[web3Data.id].childParams) {
          wipDeployment[web3Data.id].childParams = []
        }

        wipDeployment[web3Data.id].childParams.push({
          type: 'address',
          paramId: output.target,
          contractId: output.targetParent,
          deploymentOrder:
            this.props.dappTemplate.contractNodes[output.targetParent].deploymentOrder,
        })
      }
    })

    this.props.updateWipDappDeployment(wipDeployment)
    this.props.closeContractForm()
  }

  /**
   * Primary render workhorse. Gets form components and sets up handlers per
   * Redux state.
   */
  getFunctionForm = () => {

    const { classes } = this.props

    const nodes = this.props.graph.elements.nodes
    const graphType = this.props.graph.type
    // const selectedNode = nodes[this.props.selectedContractFunction]

    const formData = this.getFunctionFormData()

    let submitHandler; let functionCall = false

    switch (graphType) {

      case graphTypes.contract._constructor:

        submitHandler = this.handleConstructorSubmit
        break

      case graphTypes.contract.functions:

        functionCall = true
        submitHandler = this.handleFunctionSubmit
        break

      case graphTypes.dapp.template:

        // in the case of a dapp, a function id is selected in Grapher by an
        // event handler in the Joint paper and passed to
        // this.props.selectedContractFunction

        submitHandler = this.handleDappFunctionSubmit
        break

      default:
        throw new Error('unhandled graph type: ' + graphType)
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
          ? (
              <form
                className={classes.container}
                onSubmit={submitHandler(formData.web3Data)}
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
                  {
                    !(
                      functionCall &&
                      !this.props.selectedContractFunction
                    )
                    ? <Button
                        className={classes.button}
                        variant="contained"
                        type="submit"
                      >
                        {
                          graphType === graphTypes.dapp.template
                          ? 'Save Inputs'
                          : functionCall
                            ? 'Call Function'
                            : 'Deploy'
                        }
                      </Button>
                    : null
                  }
                </div>
              </form>
            )
          : null
        }
      </Fragment>
    )
  }

  /**
   * Gets form fields and generates web3 data object for completing web3 calls.
   *
   * @returns {object} form metadata and corresponding web3 (contract) data
   */
  getFunctionFormData = () => {

    const nodes = this.props.graph.elements.nodes
    const edges = this.props.graph.elements.edges
    const functionId = this.props.selectedContractFunction
    const functionNodes = []

    Object.values(nodes).forEach(node => {
      if (node.id === functionId || node.parent === functionId) {
        functionNodes.push(node)
      }
    })

    const web3Data = {
      params: {},
      outputs: {},
      paramOrder: [],
    }
    const fields = []

    functionNodes.forEach(node => {

      if (
        Object.values(graphTypes.contract).includes(node.type) ||
        node.type === 'function'
      ) {

        web3Data.title = node.displayName
        web3Data.abiName = node.abiName
        web3Data.id = node.id

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

        web3Data.params[node.id] = paramData

        web3Data.paramOrder.push(node.id)

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
                  : this.state.fieldValues[node.id] || ''
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
            web3Data.outputs[edge.id] = {
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
      return (
        web3Data.params[a.props.id].paramOrder -
        web3Data.params[b.props.id].paramOrder
      )
    })
    web3Data.paramOrder.sort((a, b) => {
      return web3Data.params[a].paramOrder - web3Data.params[b].paramOrder
    })

    return {web3Data, fields}
  }

  /**
   * Gets value for field defined by edge in dapp graph.
   *
   * @param {object} edge edge defining value of field
   * @returns {string} field value
   */
  getSourcedFieldValue = edge => {

    // TODO: handle remaining possible value sources
    if (edge.sourceParent === 'account') {
      return 'Current Account Address'
    }
    if (edge.sourceAbiType === 'address') {
      return 'Deployed Contract Address'
    }
    throw new Error('unknown field value')
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
  graph: PropTypes.object,
  updateWipDappDeployment: PropTypes.func,
  dappTemplate: PropTypes.object,
  wipDappDeployment: PropTypes.object,
  fieldValues: PropTypes.object,
  storeFieldValues: PropTypes.func,
  addSnackbarNotification: PropTypes.func,
}

/**
 * HELPERS
 */

/**
 * Takes the nodes of a contract and returns objects identifying its functions.
 *
 * @param {object} nodes contract graph nodes
 * @returns {array} a sorted array of objects identifying contract functions
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
