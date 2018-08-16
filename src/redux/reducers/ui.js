
const ACTIONS = {
  CLOSE_CONTRACT_FORM_MODAL: 'UI:CONTRACT_FORM:CLOSE_CONTRACT_FORM_MODAL',
  OPEN_CONTRACT_FORM_MODAL: 'UI:CONTRACT_FORM:OPEN_CONTRACT_FORM_MODAL',
  SELECT_CONTRACT_FUNCTION: 'UI:CONTRACT_FORM:SELECT_CONTRACT_FUNCTION',
  TOGGLE_RESOURCE_MENU: 'UI:RESOURCE_MENU:TOGGLE',
}

const initialState = {
  contractForm: {
    open: false,
    selectedFunction: null,
  },
  resourceMenu: {
    open: false,
  },
}

export {
  getCloseContractFormModalAction as closeContractForm,
  getOpenContractFormModalAction as openContractForm,
  getSelectContractFunctionAction as selectContractFunction,
  getToggleResourceMenuAction as toggleResourceMenu,
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

    case ACTIONS.TOGGLE_RESOURCE_MENU:
      return {
        ...state,
        resourceMenu: {
          open: !state.resourceMenu.open,
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

function getToggleResourceMenuAction () {
  return {
    type: ACTIONS.TOGGLE_RESOURCE_MENU,
  }
}

/* Asynchronous action creators */
