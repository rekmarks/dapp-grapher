
import uuid from 'uuid/v4'
import { fromJS } from 'immutable'

import parseContract, {
  contractGraphTypes,
  getAccountGraph,
} from '../../graphing/graphGenerator'

import { setContractGraphId, removeAllContractGraphIds } from './contracts'

import { addDappTemplate, clearSelectedDappTemplate } from './dapps'

const ACTIONS = {
  SET_MODE: 'GRAPHER:SET_MODE',
  SAVE_GRAPH: 'GRAPHER:SAVE_GRAPH',
  SET_ACCOUNT_GRAPH: 'GRAPHER:SET_ACCOUNT_GRAPH',
  DELETE_GRAPH: 'GRAPHER:DELETE_GRAPH',
  DELETE_ALL_GRAPHS: 'GRAPHER:DELETE_ALL_GRAPHS',
  SELECT_GRAPH: 'GRAPHER:SELECT_GRAPH',
  SELECT_INSERTION_GRAPH: 'GRAPHER:SELECT_INSERTION_GRAPH',
  INCREMENT_INSERTIONS: 'GRAPHER:INCREMENT_INSERTIONS',
  UPDATE_WIP_GRAPH: 'GRAPHER:UPDATE_WIP_GRAPH',
  LOG_ERROR: 'GRAPHER:LOG_ERROR',
}

const grapherModes = {
  main: 'main',
  createDapp: 'createDapp',
}

const initialState = {
  selectedGraphId: null,
  insertionGraphId: null,
  insertions: 0,
  accountGraph: null,
  wipGraph: null,
  mode: grapherModes.main,
  graphs: {
    /**
     * uuid: Graph,
     */
  },
  errors: null,
}

// keys to exclude from locally stored state (in state.graphs)
const excludeKeys = [
  'container',
]

export {
  setAccountGraphThunk as setAccountGraph,
  getSetModeAction as setGrapherMode,
  selectGraphThunk as selectGraph,
  createGraphThunk as createGraph,
  getGraphCreationParameters as getCreateGraphParams,
  deleteGraphThunk as deleteGraph,
  deleteAllGraphsThunk as deleteAllGraphs,
  grapherModes,
  getUpdateWipGraphAction as updateWipGraph,
  saveWipGraphThunk as saveWipGraph,
  excludeKeys as grapherExcludeKeys,
  initialState as grapherInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.SET_MODE:
      return {
        ...state,
        mode: action.mode,
        selectedGraphId: null,
        insertionGraphId: null,
        wipGraph: null,
        insertions: 0,
      }

    case ACTIONS.SET_ACCOUNT_GRAPH:
      return {
        ...state,
        accountGraph: action.accountGraph,
      }

    case ACTIONS.SAVE_GRAPH:
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
      if (action.graphId === state.selectedGraphId) {
        newState.selectedGraphId = null
      }
      if (action.graphId === state.insertionGraphId) {
        newState.insertionGraphId = null
      }
      return newState

    case ACTIONS.DELETE_ALL_GRAPHS:
      return {
        ...state,
        graphs: {},
        selectedGraphId: null,
        insertionGraphId: null,
      }

    case ACTIONS.SELECT_GRAPH:
      return {
        ...state,
        selectedGraphId: action.graphId,
      }

    case ACTIONS.SELECT_INSERTION_GRAPH:
      return {
        ...state,
        insertionGraphId: action.graphId,
      }

    case ACTIONS.INCREMENT_INSERTIONS:
      return {
        ...state,
        insertions: state.insertions + 1,
      }

    case ACTIONS.UPDATE_WIP_GRAPH:
      return {
        ...state,
        wipGraph: action.wipGraph,
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

function getSetModeAction (mode) {
  return {
    type: ACTIONS.SET_MODE,
    mode: mode,
  }
}

function getSetAccountGraphAction (accountGraph) {
  return {
    type: ACTIONS.SET_ACCOUNT_GRAPH,
    accountGraph: accountGraph,
  }
}

function getSaveGraphAction (graphId, graph) {
  return {
    type: ACTIONS.SAVE_GRAPH,
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

function getSelectGraphAction (graphId) {
  return {
    type: ACTIONS.SELECT_GRAPH,
    graphId: graphId,
  }
}

function getSelectInsertionGraphAction (graphId) {
  return {
    type: ACTIONS.SELECT_INSERTION_GRAPH,
    graphId: graphId,
  }
}

function getIncrementInsertionsAction () {
  return {
    type: ACTIONS.INCREMENT_INSERTIONS,
  }
}

function getUpdateWipGraphAction (wipGraph) {
  return {
    type: ACTIONS.UPDATE_WIP_GRAPH,
    wipGraph: wipGraph,
  }
}

function getLogErrorAction (error) {
  return {
    type: ACTIONS.LOG_ERROR,
    error: error,
  }
}

function setAccountGraphThunk () {

  return (dispatch, getState) => {
    dispatch(
      getSetAccountGraphAction(getAccountGraph(getState().web3.account))
    )
  }
}

function selectGraphThunk (graphId) {

  return (dispatch, getState) => {

    const state = getState()
    const grapher = state.grapher

    const newGraph = grapher.graphs[graphId]

    // select graph if it exists
    if (newGraph) {

      if (state.dapps.selectedTemplateId && newGraph.get('type') !== 'dapp') {
        dispatch(clearSelectedDappTemplate())
      }

      if (grapher.mode === grapherModes.main) {

        dispatch(getSelectGraphAction(graphId))

      } else if (grapher.mode === grapherModes.createDapp) {

        if (grapher.insertionGraphId !== graphId) {
          dispatch(getSelectInsertionGraphAction(graphId))
        }
        dispatch(getIncrementInsertionsAction())

      } else {
        dispatch(getLogErrorAction(new Error('invalid grapher mode: ' +
          grapher.mode)))
      }

    } else {
      dispatch(getLogErrorAction(new Error('graph not found with id ' +
        graphId)))
    }
  }
}

function createGraphThunk (params) {

  return (dispatch, getState) => {

    const state = getState()

    // if no parameters, error
    if (!params) {
      dispatch(getLogErrorAction(new Error('no graph parameters given')))
      return
    }

    // create requested graph
    if (Object.values(contractGraphTypes).includes(params.type)) {

      // attempt to get contract JSON
      const contractName = params.contractName
      const contractJSON = state.contracts.types[contractName].artifact

      if (!contractJSON) {
        dispatch(getLogErrorAction(new Error(
          'no contract found with name: ' +
          contractName
        )))
        return
      }

      // select parser mode
      let parseMode, contractsPayloadKey
      switch (params.type) {
        case contractGraphTypes._constructor:
          parseMode = 1
          contractsPayloadKey = contractGraphTypes._constructor
          break
        case contractGraphTypes.functions:
          parseMode = 2
          contractsPayloadKey = contractGraphTypes.functions
          break
        default:
          dispatch(getLogErrorAction(new Error(
          'invalid graph type: ' + params.type)))
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

      if (!graphId) {
        dispatch(getLogErrorAction(new Error('graph has no id')))
        return
      }

      dispatch(getSaveGraphAction(graphId, fromJS(graph)))
      dispatch(setContractGraphId(
        contractName, {[contractsPayloadKey]: graphId}
      ))
      dispatch(selectGraphThunk(graphId))

    } else if (params.type === 'dappTemplate') {

      // TODO

    } else {

      dispatch(getLogErrorAction(new Error(
        'invalid graph type: ' + params.type)))
      return
    }
  }
}

function saveWipGraphThunk () {

  return (dispatch, getState) => {

    const wipGraph = getState().grapher.wipGraph

    if (!wipGraph.id) throw new Error('wipGraph has no id')

    dispatch(getSaveGraphAction(wipGraph.id, fromJS(wipGraph)))
    dispatch(addDappTemplate(wipGraph.id, wipGraph))
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

/**
 * HELPERS
 */

function getGraphCreationParameters (type, args) {

  if (!type) throw new Error('missing type')
  if (!args) throw new Error('missing args')

  if (Object.values(contractGraphTypes).includes(type)) {
    if (
      typeof args.contractName !== 'string' ||
      args.contractName.length < 1
    ) {
      throw new Error('missing contract name')
    }

  } else if (type === 'dappTemplate') {


  } else {
    throw new Error('invalid type')
  }

  return { type: type, ...args }
}
