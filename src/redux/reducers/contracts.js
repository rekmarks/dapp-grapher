
import uuid from 'uuid/v4'

import {
  contracts as defaultContracts, // all default contracts come from chain-end
  deploy as _deploy,
  getInstance,
  callInstance,
} from 'chain-end'

// reducer imports

import {
  dappDeploymentResult,
} from './dapps'

// contracts have graphs associated with them, and if a contract is removed
// this thunk is called to also delete its associated graph
import { deleteGraph } from './grapher'

import { addSnackbarNotification } from './ui'

// misc imports

import { graphTypes } from '../../graphing/graphGenerator'
import { getDisplayAddress } from '../../utils' // eth address truncation

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
  ADD_DAPP_ID: 'CONTRACTS:ADD_DAPP_ID', // TODO: track the dapps that a contract instance is associated with?
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

// each contract type has different graphs associated with it, which are
// deterministically generated on an as-needed basis
const contractTypes = {}
Object.entries(defaultContracts).forEach(([key, value]) => {
  contractTypes[key] = {
    [graphTypes.contract._constructor]: null,
    [graphTypes.contract.functions]: null,
    artifact: value, // Truffle compilation output
  }
})

const initialState = {

  // deployed contract instances
  instances: {
    // id: {
    //   truffleContract,
    //   address,
    //   account,
    //   type,
    //   constructorParams,
    //   networkId,
    //   dappTemplateIds,
    //   templateNodeId,
    // }
  },

  // used when deploying dapps
  deploymentQueue: null,

  // TODO: store these by uuids, not names
  types: contractTypes,

  // error storage
  errors: [],

  // contract instance call storage
  callHistory: [],

  // address of currently selected contract, if any
  selectedAddress: null,

  // false if a web3-related thunk has yet to complete, preventing further web3
  // calls
  ready: true,
}

// properties excluded from persisted state
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
            [graphTypes.contract._constructor]: null,
            [graphTypes.contract.completeAbi]: null,
            [graphTypes.contract.functions]: null,
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
            ...action.data,
          },
        },
      }

    case ACTIONS.REMOVE_ALL_GRAPH_IDS:

      const contractTypes = { ...state.types }
      Object.keys(contractTypes).forEach(contractName => {
        contractTypes[contractName] = {
          artifact: contractTypes[contractName].artifact,
          [graphTypes.contract._constructor]: null,
          [graphTypes.contract.completeAbi]: null,
          [graphTypes.contract.functions]: null,
        }
      })

      return {
        ...state,
        types: { ...contractTypes },
      }

    case ACTIONS.REMOVE_CONTRACT_TYPE:
      delete state.types[action.contractName]
      return state

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

      return {
        ...state,

        instances: {
          ...state.instances,

          [action.id]: {
            ...action.data,
            id: action.id,
            dappTemplateIds: action.data.dappTemplateIds || [],
          },
        },
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
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

      const instances = { ...state.instances }

      const instance = instances[action.id]

      // add instance property
      if (instance) {
        instances[instance.id] = {
          ...instance,
          truffleContract: action.data.truffleContract,
        }
      } else {
        instances[action.id] = {
          ...action.data,
          id: action.id,
          constructorParams: null,
        }
      }

      return {
        ...state,
        instances: instances,
        ready: true,
      }

    case ACTIONS.ADD_INSTANCE_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
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
        callHistory: state.callHistory.concat(action.data),
        ready: true,
      }

    case ACTIONS.CALL_INSTANCE_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
        ready: true,
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
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
    data: {
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

function getDeploymentSuccessAction (id, data) {
  return {
    type: ACTIONS.DEPLOYMENT_SUCCESS,
    id: id,
    data: data,
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

function getAddInstanceSuccessAction (id, data) {
  return {
    type: ACTIONS.ADD_INSTANCE_SUCCESS,
    id: id,
    data: data,
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

function getCallInstanceSuccessAction (data) {
  return {
    type: ACTIONS.CALL_INSTANCE_SUCCESS,
    data: data,
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

// TODO: this gets called in grapher and probably all over the place. It mostly
// impacts functionality more closely associated with graphs. Review whether it
// should be handled differently to reduce coupling.
function getSelectAddressAction (address) {
  return {
    type: ACTIONS.SELECT_ADDRESS,
    address: address,
  }
}

/**
 * Adds a contract type to the app, allowing the user to deploy instances of it
 * and use it in dapps.
 *
 * @param {object} contractJson the compiled contract to be added
 */
function addContractTypeThunk (contractJson) {

  return (dispatch, getState) => {

    const state = getState()
    const contractName = contractJson.contractName

    // TODO: when contract types are stored by ID, this check will have to
    // change
    if (state.contracts.types[contractName]) {
      dispatch(getLogErrorAction(new Error(
        'cannot add duplicate contract type')))
      return
    }

    // basic validation of contract json
    if (!contractName) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: missing contract name')))
      return
    }
    if (!contractJson.abi || !contractJson.bytecode) {
      dispatch(getLogErrorAction(new Error(
        'add contract failure: contract JSON missing bytecode or abi')))
      return
    }

    // add contract type
    dispatch(getAddContractTypeAction(contractName, contractJson))
  }
}

/**
 * Deletes the contract and its associated graphs from the app.
 *
 * TODO: this functionality does not yet exist. When it's added, disallow
 * removal of contracts that are part of dapps. All instances of a dapp and
 * the dapp template itself will have to be removed before its associated
 * contracts can be deleted. The same goes for all instances of this type.
 *
 * @param {string} contractName the name of the contract to be deleted
 */
function removeContractTypeThunk (contractName) {

  return (dispatch, getState) => {

    const contract = getState().contracts.types[contractName]

    if (contract) {
      dispatch(deleteGraph(contract[graphTypes.contract._constructor]))
      dispatch(deleteGraph(contract[graphTypes.contract.completeAbi]))
      dispatch(deleteGraph(contract[graphTypes.contract.functions]))
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
 * @param {string} contractName the name of the contract to deploy
 * @param {array} constructorParams the parameters, in the order they must be
 * passed to the constructor
 */
function deployThunk (contractName, constructorParams) {

  return async (dispatch, getState) => {

    const state = getState()

    // validate pre-deployment state
    if (!prepareForDeployment(
      dispatch,
      state.contracts,
      state.web3
    )) {
      return
    }

    // notify the user that deployment has begun
    dispatch(addSnackbarNotification(
     'Deploying contract: ' + contractName,
     60000
    ))

    // make web3 deployment call
    const result = await deployContract(
      dispatch,
      state.web3,
      state.contracts.types,
      contractName,
      constructorParams
    )

    // notify user on success or failure and process result
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
 * Attempts to deploy all contracts in the deployment queue. Currently, the
 * deployment queue can either be populated by a single contract or the
 * contracts associated with a single dapp instance.
 *
 * If there are dependencies between the deployments of a dapp, this thunk
 * handles them.
 *
 * TODO: This only supports instance dependencies, i.e. deploying a contract and
 * passing its address to another deployment. Add support for method calls here
 * or elsewhere.
 *
 * @param {string} dappDisplayName the display name of the dapp being deployed
 * @param {string} dappTemplateId the id of the template of the dapp being
 * deployed
 */
function deployQueueThunk (dappDisplayName, dappTemplateId) {

  return async (dispatch, getState) => {

    const state = getState()

    // validate pre-deployment state
    if (!prepareForDeployment(
        dispatch,
        state.contracts,
        state.web3,
      )) {
      return
    }

    // get deployment queue and ensure it's sorted
    const queue = Object.values(state.contracts.deploymentQueue).sort(
      (a, b) => {
        return a.deploymentOrder - b.deploymentOrder
      }
    )

    // store dapp instance data
    const dappData = {
      displayName: dappDisplayName,
      templateId: dappTemplateId,
      account: state.web3.account,
      networkId: state.web3.networkId,
      contractInstances: [],
    }

    // in case of failure, store information in this object
    const failure = {
      index: null,
      name: null,
    }

    for (let i = 0; i < queue.length; i++) {

      const deployment = queue[i]

      // notify user that contract is being deployed
      dispatch(addSnackbarNotification(
        getQueueDeploymentMessage(
          dappDisplayName, i, queue.length, deployment.contractName
        ),
        15000
      ))

      // make web3 call
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

        // if this deployment has any dependents/children, i.e. contracts that
        // use this deployment's deployed address in their constructors
        if (deployment.childParams) {

          // iterate over them (they are set in ContractForm)
          deployment.childParams.forEach(childParam => {

            // forEach will complete all iterations, so ensure failures stops
            // it from doing more work
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
    } else { // success

      dispatch(getResetDeploymentQueueAction())
      dispatch(getEndDeploymentAction())
      dispatch(dappDeploymentResult(true, dappData))
    }
  }
}

/**
 * Attempts to add a deployed contract instance to state. Note the separation
 * between state instance objects and truffle-contract instance objects. The
 * latter is a property of the former.
 * If state instance object exists, sets its truffleContract property.
 *
 * @param {string} instanceId the contract instance id, if generated from
 * persisted state
 * @param {string} contractName the contract type of the instance
 * @param {string} address the address of the instance
 */
function addInstanceThunk (instanceId = null, contractName = null, address = null) {

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

    const provider = state.web3.provider
    const account = state.web3.account
    const networkId = state.web3.networkId

    dispatch(getAddInstanceAction())

    if (!instanceId) {

      if (!(contractName && address)) {
        dispatch(getAddInstanceFailureAction(new Error(
          'must provide contractName and address if instanceId not provided'
        )))
        return
      }

      const existingInstances = Object.values(state.contracts.instances).filter(
        i => i.networkId === networkId && i.address === address
      )
      if (existingInstances.length > 0) {
        dispatch(getAddInstanceFailureAction(
          new Error('Attempting to add duplicate instance.')
        ))
        return
      }
    } else {

      const instance = state.contracts.instances[instanceId]

      // defensive validity check
      if (
        instance.networkId !== networkId || instance.account !== account
      ) {
        dispatch(getAddInstanceFailureAction(
          new Error(
            'Attempting to add instance belonging to other network or account.'
          )
        ))
        return
      }
      contractName = instance.type
      address = instance.address
    }

    // ensure contract type is added
    if (!state.contracts.types[contractName]) {
      dispatch(getAddInstanceFailureAction(
        new Error('Contract type not added.')
      ))
      return
    }

    // make web3 call
    let instance
    try {
      instance = await getInstance(
        state.contracts.types[contractName].artifact,
        provider, address, account
      )
    } catch (error) {
      dispatch(getAddInstanceFailureAction(error))
      return
    }

    // success
    dispatch(getAddInstanceSuccessAction(
      instanceId || uuid(),
      {
        account: account,
        truffleContract: instance,
        networkId: networkId,
        type: contractName,
        // TODO: constructor parameters?
      }
    ))
  }
}

/**
 * Attempts to call a function associated with an instance stored in state.
 * Fails if instance not found in state or due to a web3 error.
 *
 * @param {string} address the address of the instance
 * @param {string} functionName the name of the function to call
 * @param {array} params the parameters to pass to the function
 * @param {string} sender the sending account
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

    // attempt to get instance
    let instance
    // TODO: remove all passing of contract address as instance identifiers
    // so that we don't have to do this
    Object.values(state.contracts.instances).forEach(i => {
      if (i.networkId === networkId && i.address === address) {
        instance = i.truffleContract
      }
    })

    if (!instance) {
      dispatch(getCallInstanceFailureAction('instance not found'))
      return
    }

    if (!instance) {
      dispatch(getCallInstanceFailureAction('missing truffleContract'))
      return
    }

    // make web3 function call
    let result
    try {
      result = await callInstance(instance, functionName, params, sender)
    } catch (error) {
      // TODO: add thunk params to below call for debugging purposes
      dispatch(getCallInstanceFailureAction(error))
      return
    }

    // success
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
 *
 * @param {func} dispatch dispatch function from calling thunk
 * @param {object} contracts contracts substate
 * @param {object} web3 redux web3 substate
 * @return {bool} true if validation successful, false otherwise
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
 *
 * @param {func} dispatch dispatch function from calling thunk
 * @param {object} web3 redux web3 substate
 * @param {object} contractTypes contract types from state
 * @param {string} contractName name of contract to deploy
 * @param {array} constructorParams constructor parameters
 * @param {string} dappTemplateId id of associated dapp template (optional)
 * @return {object} deployment data if successful, null otherwise
 */
async function deployContract (
    dispatch,
    web3,
    contractTypes,
    contractName,
    constructorParams,
    meta = {}
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

  const contractJson = contractTypes[contractName].artifact

  let instance
  try {
    instance = await _deploy( // actual web3 call happens in here
      contractJson,
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

  // success, return deployment data
  const deploymentData = {
    truffleContract: instance,
    address: instance.address,
    account: web3.account,
    type: contractJson.contractName,
    constructorParams: constructorParams,
    networkId: web3.networkId,
    dappTemplateIds: meta.dappTemplateId ? [meta.dappTemplateId] : undefined,
    templateNodeId: meta.nodeId ? meta.nodeId : undefined,
  }
  dispatch(getDeploymentSuccessAction(uuid(), deploymentData))
  return deploymentData
}

/**
 * Gets the user-facing notification message to be displayed every time a
 * contract from the deployment queue is deployed.
 *
 * @param {string} dappName the name of the dapp being deployed
 * @param {number} i the index of the contract in the queue
 * @param {number} total the length of the queue at the start of deployment
 * @param {string} contractName the name of the contract
 * @returns {string} the deployment queue message
 */
function getQueueDeploymentMessage (dappName, i, total, contractName) {
  return (
    dappName + ': Deploying contract ' + (i + 1).toString() +
    ' of ' + total.toString() + ': ' + contractName
  )
}
