
const ACTIONS = {
  CLOSE_CONTRACT_FORM_MODAL: 'UI:CLOSE_CONTRACT_FORM_MODAL',
  OPEN_CONTRACT_FORM_MODAL: 'UI:OPEN_CONTRACT_FORM_MODAL',
}

const initialState = {
  forms: {
    contractForm: false,
  },
}

export {
  getCloseContractFormModalAction as closeContractForm,
  getOpenContractFormModalAction as openContractForm,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.CLOSE_CONTRACT_FORM_MODAL:
      return {
        ...state,
        forms: {
          ...state.forms,
          contractForm: false,
        },
      }

    case ACTIONS.OPEN_CONTRACT_FORM_MODAL:
      return {
        ...state,
        forms: {
          ...state.forms,
          contractForm: true,
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

/* Asynchronous action creators */
