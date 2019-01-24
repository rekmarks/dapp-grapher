
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CloudQueueIcon from '@material-ui/icons/CloudQueue'
import SubjectIcon from '@material-ui/icons/Subject'

import NestedList from './common/NestedList'
import ListButton from './common/ListButton'

import { grapherModes} from '../redux/reducers/grapher'
import { graphTypes } from '../graphing/graphGenerator'
import { spacingUnit } from '../withMuiRoot'
import { getDisplayAddress } from '../utils'

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 2,
  },
})

/**
 * Displays and provides functionality for contract-related resources.
 * Contained within ResourceMenu.
 *
 * @extends {Component}
 */
class ContractResourceList extends Component {

  render () {

    const contractTypeNames = Object.keys(this.props.contractTypes)
    contractTypeNames.sort()

    // contains upload functionality, handled in a one-off way that breaks
    // React patterns somewhat
    const addContractTypeButton = (
      <div key="contract-upload-div" >
        {
          this.props.grapherMode !== grapherModes.createDapp
          ? <Fragment>
              <ListButton
                disabled={this.props.hasWipDeployment}
                displayText="Add Contract Type"
                icon={<AddCircleOutlineIcon />}
                onClick={() => document.querySelector('#contract-upload').click()}
                style={{ paddingLeft: spacingUnit * 4 }}
              />
              <input
                id="contract-upload"
                type="file"
                onChange={this.handleContractUpload}
                style={{display: 'none'}}
              />
            </Fragment>
          : null
        }
      </div>
    )

    const contractLists = contractTypeNames.map(contractName => {

      const currentGraphId =
        this.props.contractTypes[contractName][graphTypes.contract._constructor]

      return (
        <NestedList
          key={contractName}
          icon={(<SubjectIcon />)}
          displayText={contractName}
          buttonPadding={spacingUnit * 4}
          toolTip={true}
        >
          <ListButton
            disabled={
              this.props.displayGraphId && this.props.displayGraphId === currentGraphId
            }
            displayText="Constructor"
            icon={(<AddCircleOutlineIcon />)}
            onClick={
              () => this.props.getGraph(
              currentGraphId,
              graphTypes.contract._constructor,
              contractName
            )
            }
            style={{ paddingLeft: spacingUnit * 6 }} />
          <NestedList
            icon={(<CloudQueueIcon />)}
            displayText="Deployed"
            disabled={
              !this.props.instanceTypes ||
              !this.props.instanceTypes[contractName]
            }
            buttonPadding={spacingUnit * 6}
          >
            {
              this.props.instanceTypes &&
              this.props.instanceTypes[contractName]
              ? this.getInstanceListItems(
                  contractName,
                  this.props.contractInstances
                )
              : null
            }
          </NestedList>
        </NestedList>
      )
    })

    return [addContractTypeButton, contractLists]
  }

  /**
   * Handles contract upload. Expects a JSON-parsable text file contained in
   * event.target.
   */
  handleContractUpload = async event => {

    event.preventDefault()

    const reader = new FileReader()
    reader.onload = event => {
      this.props.addContractType(JSON.parse(event.target.result))
    }

    reader.readAsText(event.target.files[0])
  }

  /**
   * Gets the <ListButton /> elements corresponding to a contract type
   * contractName and its corresponding instances
   *
   * @param {string} contractName the contract type of the instances
   * @param {object} instances the instances of type contractName
   * @returns {object} a <ListButton /> for every instance
   */
  getInstanceListItems = (contractName, instances) => {

    if (!instances) return null

    return Object.keys(instances).sort().map(key => {

      const i = instances[key]

      const graphId =
        this.props.contractTypes[contractName][graphTypes.contract.functions]

      return (
        <ListButton
          key={i.address}
          disabled={
            this.props.displayGraphId &&
            this.props.displayGraphId === graphId &&
            Boolean(this.props.selectedContractAddress)
              ? this.props.selectedContractAddress === i.address
              : false
          }
          displayText={getDisplayAddress(i.address)}
          inset={true}
          onClick={
            () => {
              this.props.addInstance(i.id)
              this.props.getGraph(
                graphId,
                graphTypes.contract.functions,
                contractName,
                i.address
              )
            }
          }
          primaryTypographyProps={{ noWrap: true }}
          toolTip={i.address} />
      )
    })
  }
}

ContractResourceList.propTypes = {
  classes: PropTypes.object.isRequired,
  addContractType: PropTypes.func,
  addInstance: PropTypes.func,
  contractTypes: PropTypes.object,
  contractInstances: PropTypes.object,
  instanceTypes: PropTypes.object,
  selectContractAddress: PropTypes.func,
  selectedContractAddress: PropTypes.string,
  getCreateGraphParams: PropTypes.func,
  createGraph: PropTypes.func,
  selectDisplayGraph: PropTypes.func,
  displayGraphId: PropTypes.string,
  grapherMode: PropTypes.string,
  getGraph: PropTypes.func,
  hasWipDeployment: PropTypes.bool,
}

export default withStyles(styles)(ContractResourceList)
