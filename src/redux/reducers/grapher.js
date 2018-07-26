
import { contracts } from 'chain-end'

import parse from '../../graphing/contractParser'

// dev-temp - this will all happen as a result of user action
const testGraph = parse(contracts.StandardERC20, 1)
// dev-temp

const ACTIONS = {
  PARSE_CONTRACT: 'GRAPHER:PARSE_CONTRACT',
  SELECT_GRAPH: 'GRAPHER:SELECT_GRAPH',
}

const initialState = {
  contractTypes: contracts,
  selectedGraph: testGraph, // null
  graphs: {testGraph}, // {}
}

export {
  getParseContractAction,
  selectGraphThunk as selectGraph,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.PARSE_CONTRACT:

      return {
        ...state,
        graphs: {
          ...state.graphs,
          [action.contractGraph.name]: action.contractGraph,
        },
      }

    case ACTIONS.SELECT_GRAPH:
      return {
        ...state,
        selectedGraph: state.graphs[action.graphName],
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getParseContractAction (contractGraph) {
  return {
    type: ACTIONS.PARSE_CONTRACT,
    contractGraph: contractGraph,
  }
}

function getSelectGraphAction (graphName) {
  return {
    type: ACTIONS.SELECT_GRAPH,
    graphName: graphName,
  }
}

function selectGraphThunk (graphName) {

  return (dispatch, getState) => {

    const state = getState()

    state.grapher.graphs.forEach(graph => {
      if (graph.name === graphName) {

      }
    })

    dispatch(getSelectGraphAction(graphName))

    if (Object.keys(state.grapher.graphs).includes(graphName)) {
      console.log('Contract graph found with key: ' + graphName)
    } else {
      console.log('No contract graph found with key: ' + graphName)
    }
  }
}
