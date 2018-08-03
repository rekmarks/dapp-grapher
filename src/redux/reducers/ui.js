
const ACTIONS = {
  CLOSE_CONTRACT_FORM_MODAL: 'UI:CONTRACTFORM:CLOSE_CONTRACT_FORM_MODAL',
  OPEN_CONTRACT_FORM_MODAL: 'UI:CONTRACTFORM:OPEN_CONTRACT_FORM_MODAL',
  SELECT_CONTRACT_FUNCTION: 'UI:CONTRACTFORM:SELECT_CONTRACT_FUNCTION',
}

const initialState = {
  contractForm: {
    open: false,
    selectedFunction: null,
  },
}

export {
  getCloseContractFormModalAction as closeContractForm,
  getOpenContractFormModalAction as openContractForm,
  getSelectContractFunctionAction as selectContractFunction,
  initialState as uiInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.CLOSE_CONTRACT_FORM_MODAL:
      return {
        ...state,
        contractForm: {
          ...state.contractForm,
          open: false,
          selectedFunction: null,
        },
      }

    case ACTIONS.OPEN_CONTRACT_FORM_MODAL:
      return {
        ...state,
        contractForm: {
          ...state.contractForm,
          open: true,
        },
      }

    case ACTIONS.SELECT_CONTRACT_FUNCTION:
      return {
        ...state,
        contractForm: {
          ...state.contractForm,
          selectedFunction: action.func,
        },
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getCloseContractFormModalAction () {
  return {
    type: ACTIONS.CLOSE_CONTRACT_FORM_MODAL,
  }
}

function getOpenContractFormModalAction () {
  return {
    type: ACTIONS.OPEN_CONTRACT_FORM_MODAL,
  }
}

function getSelectContractFunctionAction (func) {
  return {
    type: ACTIONS.SELECT_CONTRACT_FUNCTION,
    func: func,
  }
}

/* Asynchronous action creators */
