
const ACTIONS = {
  CLOSE_MODAL: 'UI:MODAL:CLOSE',
  OPEN_MODAL: 'UI:MODAL:OPEN',
  SAVE_MODAL_FORM_FIELD_VALUES: 'UI:MODAL:SAVE_FIELD_VALUES',
  DELETE_MODAL_FORM_FIELD_VALUES: 'UI:MODAL:DELETE_FIELD_VALUES',
  SELECT_CONTRACT_FUNCTION: 'UI:CONTRACT_FORM:SELECT_CONTRACT_FUNCTION',
  ADD_SNACKBAR_NOTIFICATION: 'UI:SNACKBAR:ADD_NOTIFICATION',
}

const modalContent = {
  contractForm: 'contractForm',
  dappForm: 'dappForm',
}

const initialState = {
  modal: {
    open: false,
    content: null,
    formFieldValues: {},
  },
  contractForm: {
    selectedFunction: null,
  },
  snackbar: {
    message: null,
    duration: 6000,
  },
}

export {
  getCloseModalAction as closeModal,
  getOpenModalAction as openModal,
  getSelectContractFunctionAction as selectContractFunction,
  getSaveModalFormFieldValuesAction as saveModalFormFieldValues,
  getDeleteModalFormFieldValuesAction as deleteModalFormFieldValues,
  getAddSnackbarNotificationAction as addSnackbarNotification,
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
