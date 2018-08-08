
/**
 * Functions for converting smart contract ABIs into a more
 * useable format. All functions pure.
 *
 * TODO
 * 1. Parse contract ABI -- DONE (just use it)
 * 1a. Generate nodes -- DONE
 * 1b. Generate edges
 * 2. Parse queried information
 * Relevant: https://solidity.readthedocs.io/en/develop/abi-spec.html#JSON
 */

import util from 'util'

import graphTemplate from './graphTemplate'

const graphTypes = {
  completeAbi: 'contract:completeAbi',
  _constructor: 'contract:constructor',
  functions: 'contract:functions',
}

export {
  graphTypes as contractGraphTypes,
}

/**
 * Parses a compiled Solidity contract for use in a Cytoscape graph
 * @param  {object} contract     the compiled contract to parse
 * @param  {number} mode         determines the kind of data returned,
 *                               with the contract as a compound node
 *                               containing:
 *                                 0  the complete ABI
 *                                 1  constructor parameters
 *                                 2  functions and their parameters (excluding constructor)
 * @return {object}              a Cytoscape graph with config and style
 *                               properties
 */
export default function parseContract (contract, mode) {

  const graph = {...graphTemplate}
  graph.name = contract.contractName
  switch (mode) {
    case 0:
      graph.type = graphTypes.completeAbi
      break
    case 1:
      graph.type = graphTypes._constructor
      break
    case 2:
      graph.type = graphTypes.functions
      break
    default:
      throw new Error('invalid mode: ' + mode)
  }
  graph.id = graph.name + ':' + graph.type
  const nodeData = getNodes(contract.contractName, contract.abi, mode)
  graph.config.elements = {
    nodes: nodeData.nodes,
    edges: getEdges(contract.contractName, contract.abi, mode),
  }
  graph.layoutData = nodeData.layoutData
  return graph
}

/**
 * GRAPH ELEMENT GETTERS
 */

/**
 * [getNodes description]
 * @param  {[type]} contractName [description]
 * @param  {[type]} abi          [description]
 * @param  {[type]} mode         [description]
 * @return {[type]}              [description]
 */
function getNodes (contractName, abi, mode) {

  let nodes, layoutData

  // contract node (parent of all others)
  // parent nodes don't have positions; their position is a function
  // of their children's positions
  const contractNode = {
    data: {
      id: contractName,
      abiName: contractName,
      nodeName: getFormattedName(contractName),
    },
  }

  switch (mode) {

    case 0:
      contractNode.data.type = 'contract'
      contractNode.data.abiType = 'complete'
      nodes = getCompleteAbiNodes(contractName, abi)
      break

    case 1:
      contractNode.data.type = 'contract'
      contractNode.data.abiType = 'constructor'
      nodes = getConstructorNodes(contractName, abi)
      break

    case 2:
      contractNode.data.type = 'contract'
      contractNode.data.abiType = 'functions'
      const data = getFunctionNodes(contractName, abi)
      nodes = data.nodes
      layoutData = data.layoutData
      break

    default:
      throw new Error('getNodes: invalid mode')
  }

  nodes.push(contractNode)

  return { nodes, layoutData}
}

/**
 * Gets all nodes for a smart contract graph from its ABI, including events,
 * functions, and the constructor
 * @param  {string} contractName the name of the contract being parsed
 * @param  {object} abi          the ABI of the contract being parsed
 * @return {array}               an array of node objects
 */
function getCompleteAbiNodes (contractName, abi) {

  const contractInterfaceNodes = []
  const eventsId = contractName + '::Events'
  const functionsId = contractName + '::Functions'
  let hasFunctions = false; let hasEvents = false

  abi.forEach(entry => {
    if (!(entry.type === 'function') &&
      !(entry.type === 'constructor') &&
      !(entry.type === 'event')) {
      throw new Error('Invalid abi entry type:\n\n' + util.inspect(
        entry, {showHidden: false, depth: null}
        ) + '\n'
      )
    }

    const data = { abi: {} }
    if (entry.type === 'constructor') {
      data.id = contractName + ':constructor'
      data.nodeName = 'Constructor'
      data.type = 'constructor'
      data.parent = contractName
    } else {
      if (!entry.name) throw new Error('getNode: invalid ABI entry: missing name')
      data.id = contractName + ':' + entry.name
      data.abiName = entry.name
      data.nodeName = getFormattedName(entry.name)
      data.type = entry.type ? entry.type : 'function' // abi type defaults to function if omitted
      data.parent = data.type === 'event' ? eventsId : functionsId
    }

    if (!hasEvents) hasEvents = data.parent === eventsId
    if (!hasFunctions) hasFunctions = data.parent === functionsId

    data.abi = Object.assign(data.abi, entry) // abi may or may not have the type property

    contractInterfaceNodes.push({
      data: data,
      // some layouts allegedly require non-zero and/or non-overlapping positions
      position: { x: Math.random(), y: Math.random()},
    })
  })

  if (hasEvents) {
    contractInterfaceNodes.push({
      data: {
        id: contractName + '::Events', // extra colon to ensure no collisions
        nodeName: 'Events',
        parent: contractName,
        type: 'ui',
      },
    })
  }
  if (hasFunctions) {
    contractInterfaceNodes.push({
      data: {
        id: contractName + '::Functions', // extra colon to ensure no collisions
        nodeName: 'Functions',
        parent: contractName,
        type: 'ui',
      },
    })
  }

  return contractInterfaceNodes
}

/**
 * Parses a smart contract ABI and returns the nodes corresponding to the
 * constructor's parameters
 * @param  {string} contractName the name of the contract being parsed
 * @param  {object} abi          the ABI of the contract being parsed
 * @return {array}               an array of node objects
 */
function getConstructorNodes (contractName, abi) {

  const filtered = abi.filter(entry => entry.type === 'constructor')
  if (filtered.length !== 1) throw new Error('getNodeConstructor: invalid abi (multiple constructors)')

  const constructorAbi = filtered[0]

  // in case of parameter-less constructor
  if (!constructorAbi.inputs || constructorAbi.inputs.length < 1) return []

  const inputNodes = []
  for (const input of constructorAbi.inputs) {
    inputNodes.push({
      data: {
        id: contractName + ':constructor:' + input.name,
        nodeName: getFormattedName(input.name),
        abiName: input.name,
        parent: contractName,
        type: 'parameter',
        abi: input,
      },
      // some layouts allegedly require non-zero and/or non-overlapping positions
      position: { x: Math.random(), y: Math.random()},
    })
  }

  return inputNodes
}

/**
 * Parses a smart contract ABI and returns the nodes corresponding to functions
 * (not the constructor) and their parameters
 * @param  {string} contractName the name of the contract being parsed
 * @param  {object} abi          the ABI of the contract being parsed
 * @return {array}               an array of node objects
 */
function getFunctionNodes (contractName, abi) {

  const functionsAbi = abi.filter(
    entry => entry.type === 'function' || !entry.type
  )

  const nodes = []
  const layoutData = {
    functionsWithInputs: [],
    functionsWithoutInputs: [],
  }

  // const gettersId = contractName + '::Getters'
  // const pureId = contractName + '::Pure'
  // const mutatorsId = contractName + '::Mutators'
  // let hasGetters = false, hasPure = false, hasMutators = false

  functionsAbi.forEach(entry => {

    if (!entry.name) { throw new Error('getFunctionNodes: invalid ABI entry: missing name') }

    const functionId = contractName + ':' + entry.name

    // add function node
    const functionNode = {
      data: {
        id: functionId,
        nodeName: getFormattedName(entry.name),
        abiName: entry.name,
        parent: contractName,
        type: 'function',
        abi: entry,
      },
    }

    // TODO: entry.constant and no inputs indicates values that could be
    // programmatically retrieved and displayed in the UI
    // if (entry.stateMutability === 'view') {

    //   if (!hasGetters) hasGetters = true

    //   functionNode.data.parent = gettersId
    // } else if (entry.stateMutability === 'pure') {

    //   if (!hasPure) hasPure = true

    //   functionNode.data.parent = pureId
    // } else {

    //   if (!hasMutators) hasMutators = true

    //   functionNode.data.parent = mutatorsId
    // }

    if (!entry.inputs || entry.inputs.length === 0) {
      functionNode.data.hasChildren = false
      layoutData.functionsWithoutInputs.push(functionId)
    } else {
      functionNode.data.hasChildren = true
      layoutData.functionsWithInputs.push(functionId)
    }

    // add input nodes (if any)
    entry.inputs.forEach(input => {

      nodes.push({
        data: {
          id: functionId + ':' + input.name,
          nodeName: getFormattedName(input.name),
          abiName: input.name,
          parent: functionId,
          type: 'parameter',
          abi: input,
        },
        // some layouts allegedly require non-zero and/or non-overlapping positions
        position: { x: Math.random(), y: Math.random()},
      })
    })

    nodes.push(functionNode)
  })

  // if (hasGetters) nodes.push({
  //   data: {
  //     id: gettersId,
  //     nodeName: 'Getters',
  //     parent: contractName,
  //     type: 'ui',
  //   }
  // })
  // if (hasPure) nodes.push({
  //   data: {
  //     id: pureId,
  //     nodeName: 'Pure',
  //     parent: contractName,
  //     type: 'ui',
  //   }
  // })
  // if (hasMutators) nodes.push({
  //   data: {
  //     id: mutatorsId,
  //     nodeName: 'Mutators',
  //     parent: contractName,
  //     type: 'ui',
  //   }
  // })

  return {nodes, layoutData}
}

function getEdges (abi) {
  // TODO
  return {}
}

// function getEdge(param) {
//   // TODO
// }

/**
 * HELPERS
 */

function getFormattedName (name) {
  const formattedName = name.substring(name.search(/[a-z]/i)) // regex: /i indicates ignorecase
  return formattedName.charAt(0).toUpperCase() + formattedName.slice(1)
}
