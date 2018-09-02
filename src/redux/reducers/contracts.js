
import {
  contracts as defaultContracts,
  deploy as _deploy,
  getInstance,
  callInstance,
} from 'chain-end'

// reducer imports

import {
  dappDeploymentResult,
} from './dapps'

import { deleteGraph } from './grapher'

import { addSnackbarNotification } from './ui'

// misc imports

import { contractGraphTypes as graphTypes } from '../../graphing/graphGenerator'

import { getDisplayAddress } from '../../utils'

const ACTIONS = {
  ADD_CONTRACT_TYPE: 'CONTRACTS:ADD_CONTRACT_TYPE',
  SET_GRAPH_ID: 'CONTRACTS:SET_GRAPH_ID',
  REMOVE_ALL_GRAPH_IDS: 'CONTRACTS:REMOVE_ALL_GRAPH_IDS',
  REMOVE_CONTRACT_TYPE: 'CONTRACTS:REMOVE_CONTRACT_TYPE',
  CLEAR_ERRORS: 'CONTRACTS:CLEAR_ERRORS',
  BEGIN_DEPLOYMENT: 'CONTRACTS:BEGIN_DEPLOYMENT',
  END_DEPLOYMENT: 'CONTRACTS:END_DEPLOYMENT',
  DEPLOYMENT_SUCCESS: 'CONTRACTS:DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILURE: 'CONTRACTS:DEPLOYMENT_FAILURE',
  ENQUEUE_DEPLOYMENTS: 'CONTRACTS:ENQUEUE_DEPLOYMENTS',
  RESET_DEPLOYMENT_QUEUE: 'CONTRACTS:RESET_DEPLOYMENT_QUEUE',
  ADD_DAPP_ID: 'CONTRACTS:ADD_DAPP_ID', // TODO
  REMOVE_DAPP_ID: 'CONTRACTS:REMOVE_DAPP_ID', // TODO
  ADD_INSTANCE: 'CONTRACTS:ADD_INSTANCE',
  ADD_INSTANCE_SUCCESS: 'CONTRACTS:ADD_INSTANCE_SUCCESS',
  ADD_INSTANCE_FAILURE: 'CONTRACTS:ADD_INSTANCE_FAILURE',
  CALL_INSTANCE: 'CONTRACTS:CALL_INSTANCE',
  CALL_INSTANCE_SUCCESS: 'CONTRACTS:CALL_INSTANCE_SUCCESS',
  CALL_INSTANCE_FAILURE: 'CONTRACTS:CALL_INSTANCE_FAILURE',
  SELECT_ADDRESS: 'CONTRACTS:SELECT_ADDRESS',
  LOG_ERROR: 'CONTRACTS:LOG_ERROR',
}

const contracts = {}
Object.entries(defaultContracts).forEach(([key, value]) => {
  contracts[key] = {
    [graphTypes._constructor]: null,
    [graphTypes.completeAbi]: null,
    [graphTypes.functions]: null,
    artifact: value,
  }
})

const initialState = {
  instances: {},
  deploymentQueue: null,
  types: contracts, // TODO: store these by a unique id, not name?
  errors: null,
  callHistory: null,
  selectedAddress: null,
  ready: true,
}

const excludeKeys = [
  'truffleContract',
  'ready',
  'errors',
  'selectedAddress',
]

export {
  addContractTypeThunk as addContractType,
  getSetGraphIdAction as setContractGraphId,
  getRemoveAllGraphIdsAction as removeAllContractGraphIds,
  removeContractTypeThunk as removeContractType,
  getEnqueueDeploymentsAction as enqueueContractDeployments,
  deployThunk as deployContract,
  deployQueueThunk as deployEnqueuedContracts,
  getSelectAddressAction as selectContractAddress,
  addInstanceThunk as addInstance,
  callInstanceThunk as callInstance,
  getClearErrorsAction as clearerrors,
  excludeKeys as contractsExcludeKeys,
  initialState as contractsInitialState,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.ADD_CONTRACT_TYPE:
      return {
        ...state,
        types: {
          ...state.types,
          [action.contractName]: {
            artifact: action.artifact,
            [graphTypes._constructor]: null,
            [graphTypes.completeAbi]: null,
            [graphTypes.functions]: null,
          },
        },
      }

    case ACTIONS.SET_GRAPH_ID:
      return {
        ...state,
        types: {
          ...state.types,
          [action.contractName]: {
            ...state.types[action.contractName],
            ...action.payload,
          },
        },
      }

    case ACTIONS.REMOVE_ALL_GRAPH_IDS:

      const contractTypes = { ...state.types }
      Object.keys(contractTypes).forEach(contractName => {
        contractTypes[contractName] = {
          artifact: contractTypes[contractName].artifact,
          [graphTypes._constructor]: null,
          [graphTypes.completeAbi]: null,
          [graphTypes.functions]: null,
        }
      })

      return {
        ...state,
        types: { ...contractTypes },
      }

    case ACTIONS.REMOVE_CONTRACT_TYPE:

      if (!state.contracts.types[action.contractName]) {
        console.warn(ACTIONS.REMOVE_CONTRACT_TYPE + ': type not found')
        return state
      }

      const newState = { ...state }
      delete newState.types[action.contractName]
      return newState

    case ACTIONS.ENQUEUE_DEPLOYMENTS:
      return {
        ...state,
        deploymentQueue: action.deployments,
      }

    case ACTIONS.RESET_DEPLOYMENT_QUEUE:
      return {
        ...state,
        deploymentQueue: null,
      }

    case ACTIONS.BEGIN_DEPLOYMENT:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.END_DEPLOYMENT:
      return {
        ...state,
        ready: true,
      }

    case ACTIONS.DEPLOYMENT_SUCCESS:

      const networkId = action.payload.networkId

      // also adds Truffle instance
      return {
        ...state,

        instances: {
          ...state.instances,

          [networkId]: {
            ...state.instances[networkId],

            [action.payload.address]: {

              account: action.payload.account,
              type: action.payload.contractName,
              constructorParams: action.payload.constructorParams,
              truffleContract: action.payload.truffleContract,
              dappTemplateIds: action.payload.dappTemplateIds || [],
              templateNodeId: action.payload.templateNodeId,
            },
          },
        },
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        errors:
          state.errors
          ? state.errors.concat([action.error])
          : [action.error],
        ready: true,
      }

    case ACTIONS.SELECT_ADDRESS:
      return {
        ...state,
        selectedAddress: action.address,
      }

    case ACTIONS.ADD_INSTANCE:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.ADD_INSTANCE_SUCCESS:

      const newInstances = { ...state.instances }

      // add networkId property if it doesn't exist
      if (!newInstances[action.data.networkId]) {
        newInstances[action.data.networkId] = {}
      }

      // add instance property
      if (newInstances[action.data.networkId][action.data.truffleContract.address]) {

        newInstances[action.data.networkId][action.data.truffleContract.address] = {
          ...newInstances[action.data.networkId][action.data.truffleContract.address],
          truffleContract: action.data.truffleContract,
        }
      } else {

        newInstances[action.data.networkId][action.data.truffleContract.address] = {
          account: action.data.account,
          truffleContract: action.data.truffleContract,
          type: action.data.contractName,
          constructorParams: null,
        }
      }

      return {
        ...state,
        instances: newInstances,
        ready: true,
      }

    case ACTIONS.ADD_INSTANCE_FAILURE:
      return {
        ...state,
        errors:
          state.errors
          ? state.errors.concat([action.error])
          : [action.error],
        ready: true,
      }

    case ACTIONS.CALL_INSTANCE:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.CALL_INSTANCE_SUCCESS:
      return {
        ...state,
        callHistory:
          state.callHistory
          ? state.callHistory.concat([action.data])
          : [action.data],
        ready: true,
      }

    case ACTIONS.CALL_INSTANCE_FAILURE:
      return {
        ...state,
        errors:
          state.errors
          ? state.errors.concat([action.error])
          : [action.error],
        ready: true,
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: null,
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

/**
 * SYNCHRONOUS ACTION CREATORS
 */

function getAddContractTypeAction (contractName, artifact) {
  return {
    type: ACTIONS.ADD_CONTRACT_TYPE,
    contractName: contractName,
    artifact: artifact,
  }
}

function getSetGraphIdAction (contractName, params) {
  return {
    type: ACTIONS.SET_GRAPH_ID,
    contractName: contractName,
    payload: {
      ...params,
    },
  }
}

function getRemoveAllGraphIdsAction () {
  return {
    type: ACTIONS.REMOVE_ALL_GRAPH_IDS,
  }
}

function getRemoveContractTypeAction (contractName) {
  return {
    type: ACTIONS.REMOVE_CONTRACT_TYPE,
    contractName: contractName,
  }
}

function getBeginDeploymentAction () {
  return {
    type: ACTIONS.BEGIN_DEPLOYMENT,
  }
}

function getEnqueueDeploymentsAction (deployments) {
  return {
    type: ACTIONS.ENQUEUE_DEPLOYMENTS,
    deployments: deployments,
  }
}

function getResetDeploymentQueueAction () {
  return {
    type: ACTIONS.RESET_DEPLOYMENT_QUEUE,
  }
}

function getDeploymentSuccessAction (payload) {
  return {
    type: ACTIONS.DEPLOYMENT_SUCCESS,
    payload: payload,
  }
}

function getDeploymentFailureAction (error) {
  return {
    type: ACTIONS.DEPLOYMENT_FAILURE,
    error: error,
  }
}

function getEndDeploymentAction () {
  return {
    type: ACTIONS.END_DEPLOYMENT,
  }
}

function getAddInstanceAction () {
  return {
    type: ACTIONS.ADD_INSTANCE,
  }
}

function getAddInstanceSuccessAction (payload) {
  return {
    type: ACTIONS.ADD_INSTANCE_SUCCESS,
    data: payload,
  }
}

function getAddInstanceFailureAction (error) {
  return {
    type: ACTIONS.ADD_INSTANCE_FAILURE,
    error: error,
  }
}

function getCallInstanceAction () {
  return {
    type: ACTIONS.CALL_INSTANCE,
  }
}

function getCallInstanceSuccessAction (payload) {
  return {
    type: ACTIONS.CALL_INSTANCE_SUCCESS,
    data: payload,
  }
}

function getCallInstanceFailureAction (error) {
  return {
    type: ACTIONS.CALL_INSTANCE_FAILURE,
    error: error,
  }
}

function getClearErrorsAction () {
  return {
    type: ACTIONS.CLEAR_ERRORS,
  }
}

function getLogErrorAction (error) {
  return {
    type: ACTIONS.LOG_ERROR,
    error: error,
  }
}

function getSelectAddressAction (address) {
  return {
    type: ACTIONS.SELECT_ADDRESS,
    address: address,
  }
}

function addContractTypeThunk (contractJSON) {

  return (dispatch, getState) => {

    const state = getState()
    const contractName = contractJSON.contractName

    if (state.contracts.type[contractName]) {
      dispatch(getLogErrorAction(new Error(
        'cannot add duplicate contract type')))
      return
    }

    // validate contractJSON
    if (!contractName) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: missing contract name')))
      return
    }
    if (contractJSON.isDeployed && contractJSON.isDeployed()) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: contract type is deployed instance')))
      return
    }
    if (!contractJSON.abi || !contractJSON.bytecode) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: contract JSON missing bytecode or abi')))
      return
    }

    dispatch(getAddContractTypeAction(contractName, contractJSON))
  }
}

function removeContractTypeThunk (contractName) {

  return (dispatch, getState) => {

    const contract = getState().contracts.types[contractName]

    if (contract) {
      dispatch(deleteGraph(contract[graphTypes._constructor]))
      dispatch(deleteGraph(contract[graphTypes.completeAbi]))
      dispatch(deleteGraph(contract[graphTypes.functions]))
      dispatch(getRemoveContractTypeAction(contractName))
    } else {
      dispatch(getLogErrorAction(new Error('contract type not found')))
    }
  }
}

/**
 * ASYNCHRONOUS ACTION CREATORS
 */

/**
 * Attempts to deploy the given contract by calling its constructor with the
 * given parameters. Handles success and failure.
 *
 * @param  {string} contractName      the name of the contract to deploy
 * @param  {array}  constructorParams the parameters, in the order they must be
 *                                    passed to the constructor
 */
function deployThunk (contractName, constructorParams) {

  return async (dispatch, getState) => {

    const state = getState()

    if (!prepareForDeployment(
      dispatch,
      state.contracts,
      state.web3
    )) {
      return
    }

    dispatch(addSnackbarNotification(
     'Deploying contract: ' + contractName,
     15000
    ))

    const result = await deployContract(
      dispatch,
      state.web3,
      state.contracts.types,
      contractName,
      constructorParams
    )

    if (result) {
      dispatch(addSnackbarNotification(
        contractName + ' successfully deployed at: ' +
        getDisplayAddress(result.address),
        6000
      ))
      dispatch(getEndDeploymentAction())
    } else {
      dispatch(addSnackbarNotification(
        'Deployment of ' + contractName + ' failed. See logs.',
        12000
      ))
    }
  }
}

/**
 * Attempts to deploy all contracts in the deployment queue. Handles success
 * and failure.
 */
function deployQueueThunk (dappDisplayName, dappTemplateId) {

  return async (dispatch, getState) => {

    const state = getState()

    if (!prepareForDeployment(
        dispatch,
        state.contracts,
        state.web3,
      )) {
      return
    }

    const queue = Object.values(state.contracts.deploymentQueue).sort(
      (a, b) => {
        return a.deploymentOrder - b.deploymentOrder
      }
    )

    const dappData = {
      displayName: dappDisplayName,
      templateId: dappTemplateId,
      account: state.web3.account,
      networkId: state.web3.networkId,
      contractInstances: [],
    }

    const failure = {
      index: null,
      name: null,
    }

    for (let i = 0; i < queue.length; i++) {

      const deployment = queue[i]

      dispatch(addSnackbarNotification(
        getQueueDeploymentMessage(
          dappDisplayName, i, queue.length, deployment.contractName
        ),
        15000
      ))

      const result = await deployContract(
        dispatch,
        state.web3,
        state.contracts.types,
        deployment.contractName,
        deployment.params,
        {
          dappTemplateId,
          nodeId: deployment.nodeId,
        }
      )

      if (result) {

        dappData.contractInstances.push(result.address)

        // if this deployment has any dependents/children
        if (deployment.childParams) {

          // iterate over them (they are set in ContractForm)
          deployment.childParams.forEach(childParam => {

            if (failure.name) return

            const childDeployment = queue[childParam.deploymentOrder]

            // TODO: add support for non-addresses
            // currently the only supported child param type is address
            if (childParam.type === 'address') {

              childDeployment.params[childParam.paramId].value = result.address

            } else {

              failure.index = i
              failure.name = deployment.contractName
            }
          })
          if (failure.name) break
        }
      } else {

        failure.index = i
        failure.name = deployment.contractName
        break
      }
    }

    if (failure.name) {

      dispatch(getResetDeploymentQueueAction())
      dispatch(getEndDeploymentAction())
      dispatch(dappDeploymentResult(
        false,
        {
          displayName: dappDisplayName,
          error: new Error(
            'deployment ' + failure.index + ': ' + failure.name + ' failed'
          ),
        }
      ))
    } else {

      dispatch(getResetDeploymentQueueAction())
      dispatch(getEndDeploymentAction())
      dispatch(dappDeploymentResult(true, dappData))
    }
  }
}

/**
 * Attempts to add a deployed contract instance to state.
 * Fails if contract type not yet added, if instance already exists, or if
 * no valid contract is found at the given address on the current network.
 *
 * @param {string} contractName the contract type of the instance
 * @param {string} address      the address of the instance
 */
function addInstanceThunk (contractName, address) {

  return async (dispatch, getState) => {

    const state = getState()
    if (!state.contracts.ready) {
      dispatch(getAddInstanceFailureAction(new Error('contracts not ready')))
      return
    }
    if (!state.web3.ready) {
      dispatch(getAddInstanceFailureAction(new Error('web3 not ready')))
      return
    }

    const account = state.web3.account
    const networkId = state.web3.networkId
    const provider = state.web3.provider

    dispatch(getAddInstanceAction())

    let oldInstance
    try {
      oldInstance = state.contracts.instances[networkId][address].truffleContract
    } catch (error) {} // do nothing

    if (oldInstance) {
      dispatch(getAddInstanceFailureAction(
        new Error('instance already added')
      ))
     return
    }

    if (!state.contracts.types[contractName]) {
      dispatch(getAddInstanceFailureAction(
        new Error('missing contract type')
      ))
     return
    }

    const artifact = state.contracts.types[contractName].artifact

    let instance
    try {
      instance = await getInstance(artifact, provider, address, account)
    } catch (error) {
      dispatch(getAddInstanceFailureAction(error))
      return
    }

    dispatch(getAddInstanceSuccessAction({
      account: account,
      truffleContract: instance,
      networkId: networkId,
      type: contractName,
      // TODO: constructor parameters?
    }))
  }
}

/**
 * Attempts to call a function associated with an instance stored in state.
 * Fails if instance not found in state or due to a web3 error.
 * @param  {string} address      the address of the instance
 * @param  {string} functionName the name of the function to call
 * @param  {array} params        the parameters to pass to the function
 * @param  {string} sender       the sending account
 */
function callInstanceThunk (address, functionName, params = null, sender = null) {

  return async (dispatch, getState) => {

    const state = getState()
    if (!state.contracts.ready) {
      dispatch(getCallInstanceFailureAction(new Error('contracts not ready')))
      return
    }
    if (!state.web3.ready) {
      dispatch(getCallInstanceFailureAction(new Error('web3 not ready')))
      return
    }

    dispatch(getCallInstanceAction())

    const networkId = state.web3.networkId

    let instance
    try {
      instance = state.contracts.instances[networkId][address].truffleContract
    } catch (error) {
      dispatch(getCallInstanceFailureAction(error))
      return
    }

    if (!instance) {
      dispatch(getCallInstanceFailureAction('missing truffleContract'))
      return
    }

    let result
    try {
      result = await callInstance(instance, functionName, params, sender)
    } catch (error) {
      dispatch(getCallInstanceFailureAction(error)) // TODO: add thunk params
      return
    }

    dispatch(getCallInstanceSuccessAction({
      timestamp: new Date().toLocaleString('en-US', {hour12: false}),
      address: address,
      functionName: functionName,
      params: params,
      sender: sender,
      result: result,
    }))
  }
}

/**
 * HELPERS
 */

/**
 * Validates pre-deployment state and, on success, sets contracts.ready to
 * false to indicate that deployment is in progress.
 * @param  {func}   dispatch     dispatch function from calling thunk
 * @param  {object} contracts    contracts substate
 * @param  {object} web3         web3 substate
 * @return {bool}                true if validation successful, false otherwise
 */
function prepareForDeployment (dispatch, contracts, web3) {

  if (!contracts.ready) {
    dispatch(getDeploymentFailureAction(new Error('contracts not ready')))
    return false
  }
  if (!web3.ready) {
    dispatch(getDeploymentFailureAction(new Error('web3 not ready')))
    return false
  }
  if (!web3.provider) {
    dispatch(getDeploymentFailureAction(new Error('missing web3 provider')))
    return false
  }
  if (!web3.account) {
    dispatch(getDeploymentFailureAction(new Error('missing web3 account')))
    return false
  }
  dispatch(getBeginDeploymentAction())
  return true
}

/**
 * Helper performing actual deployment work.
 * Validates that the contract's artifact exists and that the web3 call is
 * successful.
 * @param  {func}   dispatch          dispatch function from calling thunk
 * @param  {object} web3              web3 substate
 * @param  {object} contractTypes     contract types from state
 * @param  {string} contractName      name of contract to deploy
 * @param  {array}  constructorParams constructor parameters
 * @param  {string} dappTemplateId    id of associated dapp template (optional)
 * @return {object}                   deployment data if successful, null
 *                                    otherwise
 */
async function deployContract (
    dispatch,
    web3,
    contractTypes,
    contractName,
    constructorParams,
    meta = null
  ) {

  if (
    !contractTypes[contractName] ||
    !contractTypes[contractName].artifact
  ) {
    dispatch(getDeploymentFailureAction(new Error(
      'no contract with name ' + contractName + ' found'
    )))
    return null
  }

  let finalParams = []
  if (!Array.isArray(constructorParams)) {

    // convert object of params with data to array of param values
    finalParams = Object.keys(constructorParams).sort((a, b) => {
      return constructorParams[a].paramOrder - constructorParams[b].paramOrder
    }).map(key => constructorParams[key].value)

  } else {

    finalParams = constructorParams
  }

  const contractJSON = contractTypes[contractName].artifact

  let instance
  try {
    instance = await _deploy(
      contractJSON,
      finalParams,
      web3.provider,
      web3.account
    )
  } catch (error) {
    dispatch(getDeploymentFailureAction(error))
    return null
  }

  if (!instance) {
    dispatch(getDeploymentFailureAction(new Error(
      'deployment returned no instance'
    )))
    return null
  }

  const deploymentData = {
    truffleContract: instance,
    address: instance.address,
    account: web3.account,
    contractName: contractJSON.contractName,
    constructorParams: constructorParams,
    networkId: web3.networkId,
    dappTemplateIds: meta.dappTemplateId ? [meta.dappTemplateId] : undefined,
    templateNodeId: meta.nodeId ? meta.nodeId : undefined,
  }
  dispatch(getDeploymentSuccessAction(deploymentData))
  return deploymentData
}

function getQueueDeploymentMessage (dappName, i, total, contractName) {
  return (
    dappName + ': Deploying contract ' + (i + 1).toString() +
    ' of ' + total.toString() + ': ' + contractName
  )
}
