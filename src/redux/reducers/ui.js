
const ACTIONS = {
  CLOSE_APP_MODAL: 'UI:APP_MODAL:CLOSE',
  OPEN_APP_MODAL: 'UI:APP_MODAL:OPEN',
  SELECT_CONTRACT_FUNCTION: 'UI:CONTRACT_FORM:SELECT_CONTRACT_FUNCTION',
  SAVE_CONTRACT_FORM_FIELD_VALUES: 'UI:CONTRACT_FORM:SAVE_FIELD_VALUES',
  DELETE_CONTRACT_FORM_FIELD_VALUES: 'UI:CONTRACT_FORM:DELETE_FIELD_VALUES',
}

const initialState = {
  appModal: {
    open: false,
  },
  contractForm: {
    selectedFunction: null,
    fieldValues: {},
  },
}

export {
  getCloseAppModalAction as closeAppModal,
  getOpenAppModalAction as openAppModal,
  getSelectContractFunctionAction as selectContractFunction,
  getSaveContractFormFieldValuesAction as saveContractFormFieldValues,
  getDeleteContractFormFieldValuesAction as deleteContractFormFieldValues,
  initialState as uiInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.CLOSE_APP_MODAL:
      return {
        ...initialState,
      }

    case ACTIONS.OPEN_APP_MODAL:
      return {
        ...state,
        appModal: {
          open: true,
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

    case ACTIONS.SAVE_CONTRACT_FORM_FIELD_VALUES:
      return {
        ...state,
        contractForm: {
          ...state.contractForm,
          fieldValues: {
            ...state.contractForm.fieldValues,
            ...action.fieldValues,
          },
        },
      }

    case ACTIONS.DELETE_CONTRACT_FORM_FIELD_VALUES:
      return {
        ...state,
        contractForm: {
          ...state.contractForm,
          fieldValues: {},
        },
      }

    default:
      return state
  }
}

/**
 * SYNCHRONOUS ACTION CREATORS
 */

function getCloseAppModalAction () {
  return {
    type: ACTIONS.CLOSE_APP_MODAL,
  }
}

function getOpenAppModalAction () {
  return {
    type: ACTIONS.OPEN_APP_MODAL,
  }
}

function getSelectContractFunctionAction (functionId) {
  return {
    type: ACTIONS.SELECT_CONTRACT_FUNCTION,
    functionId: functionId,
  }
}

function getSaveContractFormFieldValuesAction (fieldValues) {
  return {
    type: ACTIONS.SAVE_CONTRACT_FORM_FIELD_VALUES,
    fieldValues: fieldValues,
  }
}

function getDeleteContractFormFieldValuesAction () {
  return {
    type: ACTIONS.DELETE_CONTRACT_FORM_FIELD_VALUES,
  }
}
