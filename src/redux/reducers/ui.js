
const ACTIONS = {
  SET_CANVAS: 'UI:SET_CANVAS',
}

const initialState = {
  canvasComponent: 'Grapher',
}

const canvasComponents = ['Grapher', 'ContractForm']

export {
  getSetCanvasAction as setCanvas,
  canvasComponents,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.SET_CANVAS:

      return {
        ...state,
        canvasComponent: action.canvasComponent,
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getSetCanvasAction (componentName) {
  return {
    type: ACTIONS.SET_CANVAS,
    canvasComponent: componentName,
  }
}
