
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

/**
 * Parses a compiled Solidity contract for use in a Cytoscape graph
 * @param  {object} contract     the compiled contract to parse
 * @param  {number} mode         determines the kind of data returned,
 *                               with the contract as a compound node
 *                               containing:
 *                                 0  the complete ABI
 *                                 1  constructor parameters
 * @return {object}              a Cytoscape graph with config and style
 *                               properties
 */
export default function parseContract (contract, mode) {

  const graph = {...graphTemplate}
  graph.name = contract.contractName
  graph.type = mode === 1 ? 'contract:constructor' : 'contract:completeAbi'
  graph.id = graph.name + ':' + graph.type
  graph.config.elements = {
    nodes: getNodes(contract.contractName, contract.abi, mode),
    edges: getEdges(contract.contractName, contract.abi, mode),
  }
  return graph
}

/**
 * [getNodes description]
 * @param  {[type]} contractName [description]
 * @param  {[type]} abi          [description]
 * @param  {[type]} mode         [description]
 * @return {[type]}              [description]
 */
function getNodes (contractName, abi, mode) {

  let nodes = []

  // contract node (parent of all others)
  // parent nodes don't have positions; their position is a function
  // of their children's positions
  const contractNode = {
    data: {
      id: contractName,
      nodeName: getFormattedName(contractName),
    },
  }

  switch (mode) {
    case 0:
      contractNode.data.type = 'contract'
      contractNode.data.abi = 'complete'
      nodes = nodes.concat(getAllNodes(contractName, abi))
      break
    case 1:
      contractNode.data.type = 'contract'
      contractNode.data.abi = 'constructor'
      nodes = nodes.concat(getConstructorNodes(contractName, abi))
      break
    default:
      throw new Error('getNodes: invalid mode')
  }

  nodes.push(contractNode)

  return nodes
}

/**
 * Gets all nodes for a smart contract graph from its ABI, including events,
 * functions, and the constructor
 * @param  {string} contractName the name of the contract being parsed
 * @param  {object} abi          the ABI of the contract being parsed
 * @return {array}               an array of node objects
 */
function getAllNodes (contractName, abi) {

  const nodes = []; let hasFunctions = false; let hasEvents = false
  const eventsId = contractName + '::Events'
  const functionsId = contractName + '::Functions'

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
      data.nodeName = getFormattedName(entry.name)
      data.type = entry.type ? entry.type : 'function' // abi type defaults to function if omitted
      data.parent = data.type === 'event' ? eventsId : functionsId
    }

    if (!hasEvents) hasEvents = data.parent === eventsId
    if (!hasFunctions) hasFunctions = data.parent === functionsId

    data.abi = Object.assign(data.abi, entry) // abi may or may not have the type property

    nodes.push({
      data: data,
      // some layouts allegedly require non-zero or non-overlapping positions
      position: { x: Math.random(), y: Math.random()},
    })
  })

  if (hasEvents) {
    nodes.push({
      data: {
        id: contractName + '::Events', // extra colon to ensure no collisions
        nodeName: 'Events',
        parent: contractName,
      },
    })
  }
  if (hasFunctions) {
    nodes.push({
      data: {
        id: contractName + '::Functions', // extra colon to ensure no collisions
        nodeName: 'Functions',
        parent: contractName,
      },
    })
  }

  return nodes
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
        parent: contractName,
        type: 'parameter',
        abi: input,
      },
      // some layouts allegedly require non-zero or non-overlapping positions
      position: { x: Math.random(), y: Math.random()},
    })
  }

  return inputNodes
}

function getEdges (abi) {
  // TODO
  return {}
}

// function getEdge(param) {
//   // TODO
// }

/* helpers */

function getFormattedName (name) {
  const formattedName = name.substring(name.search(/[a-z]/i)) // regex: /i indicates ignorecase
  return formattedName.charAt(0).toUpperCase() + formattedName.slice(1)
}
