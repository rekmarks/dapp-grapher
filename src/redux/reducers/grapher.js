
import uuid from 'uuid/v4'

import parseContract from '../../graphing/contractParser'
import { addContractGraphId } from './contracts'

// testing
// import { contracts } from 'chain-end'
// const testGraph = parseContract(contracts.StandardERC20, 1)
// testing

// TODO: available graphs must track the contracts reducer?
  // Solution: write and export thunk that iterates through graphs
  // and updates accordingly
const ACTIONS = {
  ADD_GRAPH: 'GRAPHER:ADD_GRAPH',
  DELETE_GRAPH: 'GRAPHER:DELETE_GRAPH',
  SELECT_GRAPH: 'GRAPHER:SELECT_GRAPH',
  LOG_ERROR: 'GRAPHER:LOG_ERROR',
}

const initialState = {
  selectedGraph: null,
  graphs: {},
  errors: null,
}

const excludeKeys = [
  'container',
  'selectedGraph',
  'errors',
]

export {
  selectGraphThunk as selectGraph,
  createGraphThunk as createGraph,
  getGraphCreationParameters as getCreateGraphParams,
  getRemoveGraphAction as removeGraph,
  excludeKeys as grapherExcludeKeys,
  initialState as grapherInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.ADD_GRAPH:
      return {
        ...state,
        graphs: {
          ...state.graphs,
          [action.graphId]: action.graph,
          },
        }

    case ACTIONS.DELETE_GRAPH:

      if (!action.grahpId) return state
      if (!state.graphs[action.graphId]) {
        console.warn('no graph with id "' + action.graphId + '" found')
        return state
      }

      const newState = {...state}
      delete newState.graphs[action.graphId]
      return newState

    case ACTIONS.SELECT_GRAPH:
      return {
        ...state,
        selectedGraph: action.graphId,
      }

    case ACTIONS.LOG_ERROR:
      return {
        ...state,
        errors: state.errors
          ? state.errors.concat([action.error])
          : [action.error],
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getAddGraphAction (graphId, graph) {
  return {
    type: ACTIONS.ADD_GRAPH,
    graphId: graphId,
    graph: graph,
  }
}

function getRemoveGraphAction (graphId) {
  return {
    type: ACTIONS.DELETE_GRAPH,
    graphId: graphId,
  }
}

function getSelectGraphAction (graphId) {
  return {
    type: ACTIONS.SELECT_GRAPH,
    graphId: graphId,
  }
}

function getLogErrorAction (error) {
  return {
    type: ACTIONS.LOG_ERROR,
    error: error,
  }
}

function selectGraphThunk (graphId) {

  return (dispatch, getState) => {

    const state = getState()

    // select graph if it exists
    if (state.grapher.graphs[graphId]) {
      dispatch(getSelectGraphAction(graphId))
      return
    } else {
      dispatch(getLogErrorAction(new Error('graph not found with id ' +
        graphId)))
      return
    }
  }
}

function createGraphThunk (params) {

  return (dispatch, getState) => {

    // if no parameters, error
    if (!params) {
      dispatch(getLogErrorAction(new Error('no graph parameters given')))
      return
    }

    // create requested graph
    if (params.type === 'contract') {

      // attempt to get contract JSON
      const contractName = params.contractName
      const contractJSON = getState().contracts.types[contractName].artifact

      if (!contractJSON) {
        dispatch(getLogErrorAction(new Error(
          'no contract found with name: ' +
          contractName
        )))
        return
      }

      // select parser mode
      let parseMode
      switch (params.subType) {
        case 'constructor':
          parseMode = 1
          break
        case 'deployed':
          parseMode = 0
          break
        default:
          dispatch(getLogErrorAction(new Error(
          'invalid graph subType: ' + params.subType)))
          return
      }

      let graph
      try {
        graph = parseContract(contractJSON, parseMode)
      } catch (error) {
        dispatch(getLogErrorAction(error))
        return
      }

      const graphId = uuid()
      const payloadKey = parseMode === 1 ? 'constructorGraphId' : 'deployedGraphId'

      dispatch(getAddGraphAction(graphId, graph))
      dispatch(selectGraphThunk(graphId))
      dispatch(addContractGraphId(contractName, {[payloadKey]: graphId}))

    } else if (params.type === 'dapp') {

      // TODO

    } else {

      dispatch(getLogErrorAction(new Error(
        'invalid graph type: ' + params.type)))
      return
    }
  }
}

// TODO
// function addCompoundGraphThunk (params) {

// }

/* helpers */

function getGraphCreationParameters (type, subType = null, contractName = null) {

  if (!type) throw new Error('missing type')

  const returnProperties = {}

  if (type === 'contract') {

    const contractSubtypes = ['constructor', 'deployed']

    if (!contractSubtypes.includes(subType)) {
      throw new Error('missing contract graph subtype')
    }
    if (!contractName) throw new Error('missing contract name')

    returnProperties.contractName = contractName
    returnProperties.subType = subType

  } else if (type === 'dapp') {
    // TODO
  } else {
    throw new Error('invalid type')
  }

  return {
    type: type,
    ...returnProperties,
  }
}
