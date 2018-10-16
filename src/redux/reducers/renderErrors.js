
const ACTIONS = {
  CLEAR_ERRORS: 'ERRORS:CLEAR_ERRORS',
  LOG_ERROR: 'ERRORS:LOG_ERROR',
}

const initialState = {
  errors: [],
}

export {
  getClearErrorsAction as clearRenderErrors,
  getLogErrorAction as logRenderError,
  initialState as renderErrorsInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.LOG_ERROR:
      return {
        ...state,
        errors: state.errors.concat(action.error),
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getClearErrorsAction () {
  return {
    type: ACTIONS.CLEAR_ERRORS,
  }
}

function getLogErrorAction (error, errorInfo) {
  return {
    type: ACTIONS.LOG_ERROR,
    error: {error, errorInfo},
  }
}
