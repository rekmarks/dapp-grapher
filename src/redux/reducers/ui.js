
const ACTIONS = {
  CLOSE_APP_MODAL: 'UI:APP_MODAL:CLOSE',
  OPEN_APP_MODAL: 'UI:APP_MODAL:OPEN',
  SELECT_CONTRACT_FUNCTION: 'UI:CONTRACT_FORM:SELECT_CONTRACT_FUNCTION',
}

const initialState = {
  appModal: {
    open: false,
  },
  contractForm: {
    selectedFunction: null,
  },
}

export {
  getCloseAppModalAction as closeAppModal,
  getOpenAppModalAction as openAppModal,
  getSelectContractFunctionAction as selectContractFunction,
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
          selectedFunction: action.func,
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

function getSelectContractFunctionAction (func) {
  return {
    type: ACTIONS.SELECT_CONTRACT_FUNCTION,
    func: func,
  }
}
