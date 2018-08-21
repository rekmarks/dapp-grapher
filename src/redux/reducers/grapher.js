
import uuid from 'uuid/v4'
import { fromJS } from 'immutable'

import parseContract, { contractGraphTypes } from '../../graphing/parseContract'
import { setContractGraphId, removeAllContractGraphIds } from './contracts'

const ACTIONS = {
  ADD_GRAPH: 'GRAPHER:ADD_GRAPH',
  DELETE_GRAPH: 'GRAPHER:DELETE_GRAPH',
  DELETE_ALL_GRAPHS: 'GRAPHER:DELETE_ALL_GRAPHS',
  SELECT_GRAPH: 'GRAPHER:SELECT_GRAPH',
  LOG_ERROR: 'GRAPHER:LOG_ERROR',
}

const initialState = {
  selectedGraphId: null,
  selectedGraphName: null,
  graphs: {
    /**
     * uuid: Graph,
     */
  },
  errors: null,
}

// keys to exclude from locally stored state
const excludeKeys = [
  'container',
  'selectedGraphId',
  'selectedGraphName',
  'errors',
]

export {
  selectGraphThunk as selectGraph,
  createGraphThunk as createGraph,
  getGraphCreationParameters as getCreateGraphParams,
  deleteGraphThunk as deleteGraph,
  deleteAllGraphsThunk as deleteAllGraphs,
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

      if (!action.graphId) return state
      if (!state.graphs[action.graphId]) {
        console.warn('no graph with id "' + action.graphId + '" found')
        return state
      }

      const newState = {...state}
      delete newState.graphs[action.graphId]
      if (action.graphId === state.selectedGraphId) { newState.selectedGraphId = null }
        newState.selectedGraphName = null
      return newState

    case ACTIONS.DELETE_ALL_GRAPHS:
      return {
        ...state,
        graphs: {},
        selectedGraphId: null,
        selectedGraphName: null,
      }

    case ACTIONS.SELECT_GRAPH:
      return {
        ...state,
        selectedGraphId: action.graphId,
        selectedGraphName: action.graphName,
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

function getDeleteGraphAction (graphId) {
  return {
    type: ACTIONS.DELETE_GRAPH,
    graphId: graphId,
  }
}

function getDeleteAllGraphsAction () {
  return {
    type: ACTIONS.DELETE_ALL_GRAPHS,
  }
}

function getSelectGraphAction (graphId, graphName) {
  return {
    type: ACTIONS.SELECT_GRAPH,
    graphId: graphId,
    graphName: graphName,
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
      dispatch(getSelectGraphAction(
        graphId,
        state.grapher.graphs[graphId].get('name'),
      ))
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
      let parseMode, payloadKey
      switch (params.subType) {
        // case contractGraphTypes.completeAbi:
        //   parseMode = 0
        //   payloadKey = contractGraphTypes.completeAbi
        //   break
        case contractGraphTypes._constructor:
          parseMode = 1
          payloadKey = contractGraphTypes._constructor
          break
        case contractGraphTypes.functions:
          parseMode = 2
          payloadKey = contractGraphTypes.functions
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

      dispatch(getAddGraphAction(graphId, fromJS(graph)))
      dispatch(setContractGraphId(contractName, {[payloadKey]: graphId}))
      dispatch(selectGraphThunk(graphId))

    } else if (params.type === 'dapp') {

      // TODO

    } else {

      dispatch(getLogErrorAction(new Error(
        'invalid graph type: ' + params.type)))
      return
    }
  }
}

function deleteGraphThunk (graphId) {

  return (dispatch, getState) => {

    const graph = getState().grapher.graphs[graphId]

    // this order of operations probably matters
    dispatch(setContractGraphId(
      graph.get('name'),
      {[graph.get('type')]: null}
    ))
    dispatch(getDeleteGraphAction(graphId))
  }
}

function deleteAllGraphsThunk (graphId) {

  return (dispatch, getState) => {
    dispatch(removeAllContractGraphIds())
    dispatch(getDeleteAllGraphsAction())
  }
}

/* helpers */

function getGraphCreationParameters (type, args) {

  if (!type) throw new Error('missing type')
  if (!args) throw new Error('missing args')

  const params = { subType: type, ...args }

  if (Object.values(contractGraphTypes).includes(type)) {
    if (
      typeof args.contractName !== 'string' ||
      args.contractName.length < 1
    ) {
      throw new Error('missing contract name')
    }

    params.type = 'contract'

  } else {
    throw new Error('invalid type')
  }

  return params
}
