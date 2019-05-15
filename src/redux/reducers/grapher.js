
import uuid from 'uuid/v4'
import { fromJS } from 'immutable'

import parseContract, {
  graphTypes,
  getAccountGraph,
} from '../../graphing/graphGenerator'

import {
  addInstance,
  selectContractAddress,
  setContractGraphId,
  removeAllContractGraphIds,
} from './contracts'

import { clearSelectedDappTemplate } from './dapps'

import { deleteModalFormFieldValues } from './ui'

const ACTIONS = {
  SET_MODE: 'GRAPHER:SET_MODE',
  SAVE_GRAPH: 'GRAPHER:SAVE_GRAPH',
  SET_ACCOUNT_GRAPH: 'GRAPHER:SET_ACCOUNT_GRAPH',
  DELETE_GRAPH: 'GRAPHER:DELETE_GRAPH',
  DELETE_ALL_GRAPHS: 'GRAPHER:DELETE_ALL_GRAPHS',
  SELECT_DISPLAY_GRAPH: 'GRAPHER:SELECT_DISPLAY_GRAPH',
  SELECT_FORM_GRAPH: 'GRAPHER:SELECT_FORM_GRAPH',
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

  // in main mode, the graph displayed in <Grapher />
  displayGraphId: null,

  // in createDapp mode, the graph being added to canvas
  insertionGraphId: null,

  // used to generate the content of <ContractForm /> when the displayGraph
  // cannot be used for that purpose (i.e. for graphTypes.dapp)
  formGraphId: null,

  // hacky counter used to indicate whether the selected insertionGraph should
  // be inserted in <Grapher />
  insertions: 0,

  // the graph object representing the current web3 account and associated data
  accountGraph: null,

  // the graph object being constructed in createDapp mode
  // if saved, essentially becomes a new dapp template
  wipGraph: null,

  mode: grapherModes.main, // the current mode

  graphs: { // the graph objects
    /**
     * uuid: Graph,
     */
  },

  errors: [], // error storage
}

export {
  setAccountGraphThunk as setAccountGraph,
  setModeThunk as setGrapherMode,
  selectFormGraphThunk as selectFormGraph,
  selectDisplayGraphThunk as selectDisplayGraph,
  saveGraphThunk as saveGraph,
  createGraphThunk as createGraph,
  getGraphThunk as getGraph,
  getGraphCreationParameters as getCreateGraphParams,
  deleteGraphThunk as deleteGraph,
  deleteAllGraphsThunk as deleteAllGraphs,
  grapherModes,
  getUpdateWipGraphAction as updateWipGraph,
  initialState as grapherInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.SET_MODE:
      return {
        ...state,
        mode: action.mode,
        displayGraphId: null,
        insertionGraphId: null,
        formGraphId: null,
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

      const newState = {...state}
      delete newState.graphs[action.graphId]
      // if the deleted graph is any of the selected graphs
      if (action.graphId === state.displayGraphId) {
        newState.displayGraphId = null
      }
      if (action.graphId === state.insertionGraphId) {
        newState.insertionGraphId = null
      }
      if (action.graphId === state.formGraphId) {
        newState.formGraphId = null
      }
      return newState

    case ACTIONS.DELETE_ALL_GRAPHS:
      return {
        ...state,
        graphs: {},
        displayGraphId: null,
        insertionGraphId: null,
        formGraphId: null,
      }

    case ACTIONS.SELECT_DISPLAY_GRAPH:
      return {
        ...state,
        displayGraphId: action.graphId,
        formGraphId: null,
      }

    case ACTIONS.SELECT_INSERTION_GRAPH:
      return {
        ...state,
        insertionGraphId: action.graphId,
      }

    case ACTIONS.SELECT_FORM_GRAPH:
      return {
        ...state,
        formGraphId: action.graphId,
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
        errors: state.errors.concat(action.error),
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

function getSelectDisplayGraphAction (graphId) {
  return {
    type: ACTIONS.SELECT_DISPLAY_GRAPH,
    graphId: graphId,
  }
}

function getSelectFormGraphAction (graphId) {
  return {
    type: ACTIONS.SELECT_FORM_GRAPH,
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

/**
 * Sets the account graph corresponding to the current account. A thunk so that
 * it doesn't have to take any parameters, the account is after all in state.
 */
function setAccountGraphThunk () {

  return (dispatch, getState) => {
    dispatch(
      getSetAccountGraphAction(getAccountGraph(getState().web3.account))
    )
  }
}

/**
 * Sets the grapher mode. Deletes modal form field values and clears the
 * selected dapp template beforehand.
 *
 * @param {string} mode value from grapherModes
 */
function setModeThunk (mode) {

  return (dispatch, getState) => {
    dispatch(deleteModalFormFieldValues())
    dispatch(clearSelectedDappTemplate())
    dispatch(getSetModeAction(mode))
  }
}

/**
 * Selects the graph corresponding to graphId, generating the graph object if it
 * doesn't already exist. If no graphId is provided, calls createGraphThunk to
 * generate the graph object corresponding to the graphType and contractName,
 * and gives it an id.
 *
 * If the graph is of a deployed contract instance, must be provided the address
 * of the deployed instance.
 *
 * TODO: will require refactor when contract types are stored by uuid's instead
 * of contract names.
 *
 * @param {string} graphId the id of the graph to be retrieved
 * @param {string} graphType the type of the graph to be retrieved
 * @param {string} contractName the name of the contract type associated with
 * the graph
 * @param {string} address the address of the graph's corresponding contract
 * instance, if appropriate
 */
function getGraphThunk (
  graphId = null,
  graphType = null,
  contractName = null,
  address = null
) {

  return (dispatch, getState) => {

    if (!graphId && (!graphType || !contractName)) {
      dispatch(getLogErrorAction(
        new Error('graphType and contractName required if no graphId provided')
      ))
      return
    }

    const state = getState()

    if (!graphType) graphType = state.grapher.graphs[graphId].type
    if (!contractName) contractName = state.grapher.graphs[graphId].name

    if (graphType === graphTypes.contract._constructor) {

      if (graphId) {
        dispatch(selectDisplayGraphThunk(graphId))
      } else {
        dispatch(createGraphThunk(
          getGraphCreationParameters(
            graphTypes.contract._constructor,
            { contractName }
          )
        ))
      }
    } else if (graphType === graphTypes.contract.functions) {

      if (!address) {
        dispatch(getLogErrorAction(
          new Error(
            'graph type is functions but address was not provided'
          )
        ))
        return
      }

      if (graphId) {
        // select graph if it's not already selected
        if (state.grapher.displayGraphId !== graphId) {
          dispatch(selectDisplayGraphThunk(graphId))
        }
      } else {
        dispatch(createGraphThunk(
          getGraphCreationParameters(
            graphTypes.contract.functions,
            { contractName }
          )
        ))
      }
      dispatch(selectContractAddress(address))
    }
  }
}

/**
 * Selects the graph with id graphId as displayGraph or insertionGraph per
 * current grapherMode. Fails if graphId does not exist in state.
 *
 * @param {string} graphId the id of the graph to be selected
 */
function selectDisplayGraphThunk (graphId) {

  return (dispatch, getState) => {

    const state = getState()
    const grapher = state.grapher

    const newGraph = grapher.graphs[graphId]

    // select graph if it exists
    if (newGraph) {

      // clear selected dapp template if the selected graph is not a dapp type
      // (dapp graphs are only selected at the same time that templates are)
      if (
        state.dapps.selectedTemplateId &&
        !Object.values(graphTypes.dapp).includes(newGraph.get('type'))
      ) {
        dispatch(clearSelectedDappTemplate())
      }

      if (grapher.mode === grapherModes.main) {

        dispatch(getSelectDisplayGraphAction(graphId))
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

/**
 * Saves a generated graph object. Converts it into an Immutable object before
 * adding to state.
 *
 * @param {object} graph the graph object to be saved
 */
function saveGraphThunk (graph) {

  return (dispatch, getState) => {

    if (!graph) {
      dispatch(getLogErrorAction(new Error('no graph given')))
      return
    }
    if (!graph.id) {
      dispatch(getLogErrorAction(new Error('graph is missing id')))
      return
    }

    dispatch(getSaveGraphAction(graph.id, fromJS(graph)))
  }
}

/**
 * Generates a graph according to params. If the user is attempting to select a
 * displayGraph, also calls selectDisplayGraphThunk.
 *
 * Handles displayGraph and formGraph, but not dappGraph, which is handled in
 * <Grapher />.
 *
 * Generated graph stored as Immutable object.
 *
 * @param {object} params from getCreateGraphParams
 */
function createGraphThunk (params) {

  return (dispatch, getState) => {

    const state = getState()

    // if no parameters, error
    if (!params) {
      dispatch(getLogErrorAction(
        new Error('createGraphThunk: no graph creation parameters given')
      ))
      return
    }

    // create requested graph
    if (Object.values(graphTypes.contract).includes(params.type)) {

      // attempt to get contract JSON
      const contractName = params.contractName
      const contractJSON = state.contracts.types[contractName].artifact

      if (!contractJSON) {
        dispatch(getLogErrorAction(new Error(
          'createGraphThunk: no contract found with name: ' +
          contractName
        )))
        return
      }

      // select parser mode
      let parseMode, contractsPayloadKey
      switch (params.type) {
        case graphTypes.contract._constructor:
          parseMode = 1
          contractsPayloadKey = graphTypes.contract._constructor
          break
        case graphTypes.contract.functions:
          parseMode = 2
          contractsPayloadKey = graphTypes.contract.functions
          break
        default:
          dispatch(getLogErrorAction(new Error(
          'createGraphThunk: invalid graph type: ' + params.type)))
          return
      }

      let graph
      try {
        graph = parseContract(contractJSON, parseMode)
      } catch (error) {
        dispatch(getLogErrorAction('createGraphThunk: ' + error.message))
        return
      }

      // generate graphId if not provided
      const graphId = params.graphId ? params.graphId : uuid()

      // save generated graph and link the contract type to graphId in
      // state.contracts
      dispatch(getSaveGraphAction(graphId, fromJS(graph)))
      dispatch(setContractGraphId(
        contractName, {[contractsPayloadKey]: graphId}
      ))

      // run displayGraph selection workflow if the created graph is not a
      // formGraph, which is handled by selectFormGraphThunk
      if (!params.formGraph) dispatch(selectDisplayGraphThunk(graphId))

    } else if (params.type === 'dappTemplate') {

      // TODO: currently this is, inappropriately?, handled in <Grapher />.
      // Explore moving the functionality here or elsewhere in the reducer.

    } else {

      dispatch(getLogErrorAction(new Error(
        'createGraphThunk: invalid graph type "' + params.type + '"')))
      return
    }
  }
}

/**
 * Sets the formGraph to the functions graph associated with contractName and
 * the deployed instance thereof at instanceAddress.
 *
 * Generates the graph if it doesn't exist in state.
 *
 * @param {string} contractName the name of the contract whose functions graph
 * will be used as the formGraph
 * @param {string} instanceAddress the address of the instance of the contract
 */
function selectFormGraphThunk (contractName, instanceAddress) {

  return (dispatch, getState) => {

    const state = getState()

    let instance
    Object.values(state.contracts.instances).forEach(i => {
      if (i.networkId === state.web3.networkId && i.address === instanceAddress) {
        instance = i
      }
    })

    // get web3 instance of contract if not already added
    if (!instance) {
      dispatch(addInstance(contractName, instanceAddress))
    }

    let graphId =
      state.contracts.types[contractName][graphTypes.contract.functions]

    // generate graphId and create graph if no id was found
    if (!graphId) {

      graphId = uuid()

      dispatch(createGraphThunk(
        getGraphCreationParameters(
          graphTypes.contract.functions,
          {
            contractName,
            graphId,
            formGraph: true,
          }
        )
      ))
    }

    // selected contract address if not already selected
    if (state.contracts.selectedAddress !== instanceAddress) {
      dispatch(selectContractAddress(instanceAddress))
    }
    // select graph as formGraph if not already added
    if (state.grapher.formGraphId !== graphId) {
      dispatch(getSelectFormGraphAction(graphId))
    }
  }
}

/**
 * Deletes the graph with id graphId from state so that it can be regenerated.
 * Useful for dev/testing purposes.
 *
 * @param {string} graphId the id of the graph to be deleted
 */
function deleteGraphThunk (graphId) {

  return (dispatch, getState) => {

    const graphs = getState().grapher.graphs

    if (!graphs[graphId]) {
      dispatch(getLogErrorAction(
        new Error('no graph with id "' + graphId + '" found')
      ))
      return
    }

    // remove graphId from contract before deleting it
    dispatch(setContractGraphId(
      graphs[graphId].get('name'),
      {[graphs[graphId].get('type')]: null}
    ))
    dispatch(getDeleteGraphAction(graphId)) // then delete the graph
  }
}

/**
 * Delete all graphs from state to allow them to be regenerated.
 * Useful for dev/testing purposes.
 */
function deleteAllGraphsThunk () {

  return (dispatch, getState) => {
    dispatch(removeAllContractGraphIds()) // first remove all contract graph ids
    dispatch(getDeleteAllGraphsAction()) // then delete all graphs
  }
}

/**
 * HELPERS
 */

/**
 * Returns params object for createGraphThunk. Used in components.
 *
 * "args" argument still poorly documented, although its use should become
 * apparent by reviewing calls of this function.
 *
 * @param {string} type the type of the graph to be created, from graphTypes
 * @param {object} args graph properties
 */
function getGraphCreationParameters (type, args) {

  if (!type) throw new Error('missing type')
  if (!args) throw new Error('missing args')

  if (Object.values(graphTypes.contract).includes(type)) {
    if (
      typeof args.contractName !== 'string' ||
      args.contractName.length < 1
    ) {
      throw new Error('missing contract name')
    }

  } else if (type === 'dappTemplate') {

    // do nothing for know, dappTemplates are made in <Grapher /> as
    // wipGraph

  } else {
    throw new Error('invalid type')
  }

  return { type: type, ...args }
}
