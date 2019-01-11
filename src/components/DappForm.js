
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import { grapherModes } from '../redux/reducers/grapher'

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

const nameFieldId = 'DappForm-name'

/**
 * Form for interacting with dapps, i.e. when adding new dapp templates or
 * deploying a new dapp instance.
 *
 * @extends {Component}
 */
class DappForm extends Component {

  state = {
    fieldValues: {},
  }

  componentDidMount () {

    if (Object.keys(this.props.fieldValues).length > 0) {
      this.setState({ fieldValues: this.props.fieldValues })
    }
  }

  componentWillUnmount () {

    // dapp field values are stored in state, but not individual contracts
    if (Object.keys(this.state.fieldValues).length > 0) {
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
        </Typography>
        {this.getForm()}
      </Fragment>
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
   * Depending on this.props.grapherMode, deploys dapp instance or adds dapp
   * template. Then clears form and closes containing modal.
   */
  handleSubmit = event => {

    event.preventDefault()

    if (this.props.grapherMode === grapherModes.main) {
      this.props.deployDapp(this.state.fieldValues[nameFieldId])
    } else if (this.props.grapherMode === grapherModes.createDapp) {
      this.props.addDappTemplate(this.state.fieldValues[nameFieldId])
      this.props.setGrapherMode(grapherModes.main)
    } else throw new Error('unknown grapher mode: ' + this.props.grapherMode)

    this.setState({ fieldValues: {} })
    this.props.closeModal()
  }


  /**
   * Render function workhorse. Returns appropriate form JSX per props.
   */
  getForm = () => {

    const classes = this.props.classes

    // TODO: centralize modal form styling. The in-line style here is copied
    // from ContractForm
    return (
      <form
        className={classes.container}
        onSubmit={this.handleSubmit}
      >
        <div className={classes.nested}>
          <TextField
            id={nameFieldId}
            label={
              this.props.grapherMode === grapherModes.createDapp
              ? 'Dapp Template Name'
              : 'Dapp Instance Name'
            }
            className={classes.textField}
            value={
              this.state.fieldValues[nameFieldId]
              ? this.state.fieldValues[nameFieldId]
              : ''
            }
            onChange={this.handleInputChange(nameFieldId)}
            margin="normal" />
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
              this.props.grapherMode === grapherModes.createDapp
              ? 'Save Template'
              : 'Deploy Dapp'
            }
          </Button>
        </div>
      </form>
    )
  }
}

export default withStyles(styles)(DappForm)

DappForm.propTypes = {
  classes: PropTypes.object.isRequired,
  heading: PropTypes.string,
  fieldValues: PropTypes.object,
  storeFieldValues: PropTypes.func,
  deployDapp: PropTypes.func,
  grapherMode: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  addDappTemplate: PropTypes.func,
  setGrapherMode: PropTypes.func,
}
