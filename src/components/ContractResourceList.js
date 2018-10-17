
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

class ContractResourceList extends Component {

  handleContractUpload = async event => {

    event.preventDefault()

    const reader = new FileReader()
    reader.onload = event => {
      this.props.addContractType(JSON.parse(event.target.result))
    }

    reader.readAsText(event.target.files[0])
  }

  render () {

    const contractTypeNames = Object.keys(this.props.contractTypes)
    contractTypeNames.sort()

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
        >
          <ListButton
            disabled={
              this.props.displayGraphId &&
              this.props.displayGraphId === currentGraphId
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
              this.props.instanceTypes
              ? this.getInstanceListItems(
                  contractName,
                  this.props.instanceTypes[contractName]
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
   * Gets the <ListButton /> elements corresponding to a contract type
   * contractName and its corresponding instances
   *
   * @param {string} contractName the contract type of the instances
   * @param {object} instances the instances of type contractName
   * @returns {object} a <ListButton /> for every instance
   */
  getInstanceListItems = (contractName, instances) => {

    if (!instances) return null

    return Object.keys(instances).sort().map(address => {

      const graphId =
          this.props.contractTypes[contractName][graphTypes.contract.functions]

      const displayAddress = getDisplayAddress(address)

      return (
        <ListButton
          key={address}
          disabled={
            this.props.displayGraphId &&
            this.props.displayGraphId === graphId &&
            Boolean(this.props.selectedContractAddress)
              ? this.props.selectedContractAddress === address
              : false
          }
          displayText={displayAddress}
          inset={true}
          onClick={
            () => this.props.getGraph(
              graphId,
              graphTypes.contract.functions,
              contractName,
              address
            )
          }
          primaryTypographyProps={{ noWrap: true }}
          toolTip={address} />
      )
    })
  }
}

ContractResourceList.propTypes = {
  classes: PropTypes.object.isRequired,
  addContractType: PropTypes.func,
  contractTypes: PropTypes.object,
  instanceTypes: PropTypes.object,
  selectContractAddress: PropTypes.func,
  selectedContractAddress: PropTypes.string,
  addInstance: PropTypes.func,
  getCreateGraphParams: PropTypes.func,
  createGraph: PropTypes.func,
  selectDisplayGraph: PropTypes.func,
  displayGraphId: PropTypes.string,
  grapherMode: PropTypes.string,
  getGraph: PropTypes.func,
  hasWipDeployment: PropTypes.bool,
}

export default withStyles(styles)(ContractResourceList)
