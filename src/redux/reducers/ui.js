
const ACTIONS = {
  CLOSE_MODAL: 'UI:MODAL:CLOSE',
  OPEN_MODAL: 'UI:MODAL:OPEN',
  SAVE_MODAL_FORM_FIELD_VALUES: 'UI:MODAL:SAVE_FIELD_VALUES',
  DELETE_MODAL_FORM_FIELD_VALUES: 'UI:MODAL:DELETE_FIELD_VALUES',
  SELECT_CONTRACT_FUNCTION: 'UI:CONTRACT_FORM:SELECT_CONTRACT_FUNCTION',
  ADD_SNACKBAR_NOTIFICATION: 'UI:SNACKBAR:ADD_NOTIFICATION',
  CLEAR_SNACKBAR_NOTIFICATION: 'UI:SNACKBAR:CLEAR_NOTIFICATION',
}

const modalContent = {
  contractForm: 'contractForm', // display ContractForm in modal
  dappForm: 'dappForm', // display DappForm in modal
}

const initialState = {
  modal: { // the app's modal is a single component that receives content
    open: false,
    content: null, // values from modalContent, used to determine content
    formFieldValues: {}, // used to store field values of forms
  },
  contractForm: { // corresponds to ContractForm component
    selectedFunction: null, // tracks which function is selected, if any
  },
  snackbar: { // snackbar notifications use a single component that receives content
    message: null, // the message string
    duration: 6000, // the visibility duration
  },
}

export {
  getCloseModalAction as closeModal,
  getOpenModalAction as openModal,
  getSelectContractFunctionAction as selectContractFunction,
  getSaveModalFormFieldValuesAction as saveModalFormFieldValues,
  getDeleteModalFormFieldValuesAction as deleteModalFormFieldValues,
  addSnackbarNotificationThunk as addSnackbarNotification,
  modalContent as modalContentTypes,
  initialState as uiInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modal: {
          ...state.modal,
          open: false,
          content: null,
        },
        contractForm: {
          ...state.contractForm,
          selectedFunction: null,
        },
      }

    case ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modal: {
          ...state.modal,
          open: true,
          content: action.content,
        },
      }

    case ACTIONS.SELECT_CONTRACT_FUNCTION:
      return {
        ...state,
        contractForm: {
          ...state.contractForm,
          selectedFunction: action.functionId,
        },
      }

    case ACTIONS.SAVE_MODAL_FORM_FIELD_VALUES:
      return {
        ...state,
        modal: {
          ...state.modal,
          formFieldValues: {
            ...state.modal.formFieldValues,
            ...action.formFieldValues,
          },
        },
      }

    case ACTIONS.DELETE_MODAL_FORM_FIELD_VALUES:
      return {
        ...state,
        modal: {
          ...state.modal,
          formFieldValues: {},
        },
      }

    case ACTIONS.ADD_SNACKBAR_NOTIFICATION:
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          message: action.message,
          duration: action.duration,
        },
      }

    case ACTIONS.CLEAR_SNACKBAR_NOTIFICATION:
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          message: null,
          duration: 6000,
        },
      }

    default:
      return state
  }
}

/**
 * SYNCHRONOUS ACTION CREATORS
 */

function getCloseModalAction () {
  return {
    type: ACTIONS.CLOSE_MODAL,
  }
}

function getOpenModalAction (content) {
  return {
    type: ACTIONS.OPEN_MODAL,
    content: content,
  }
}

function getSelectContractFunctionAction (functionId) {
  return {
    type: ACTIONS.SELECT_CONTRACT_FUNCTION,
    functionId: functionId,
  }
}

function getSaveModalFormFieldValuesAction (formFieldValues) {
  return {
    type: ACTIONS.SAVE_MODAL_FORM_FIELD_VALUES,
    formFieldValues: formFieldValues,
  }
}

function getDeleteModalFormFieldValuesAction () {
  return {
    type: ACTIONS.DELETE_MODAL_FORM_FIELD_VALUES,
  }
}

function getAddSnackbarNotificationAction (message, duration) {
  return {
    type: ACTIONS.ADD_SNACKBAR_NOTIFICATION,
    message: message,
    duration: duration,
  }
}

function getClearSnackbarNotificationAction () {
  return {
    type: ACTIONS.CLEAR_SNACKBAR_NOTIFICATION,
  }
}

/**
 * Sets the next snackbar notification.
 *
 * @param {string} message the notification message string
 * @param {number} duration the notification visibility duration
 */
function addSnackbarNotificationThunk (message, duration) {

  return (dispatch, getState) => {

    dispatch(getClearSnackbarNotificationAction())
    dispatch(getAddSnackbarNotificationAction(message, duration))
  }
}
