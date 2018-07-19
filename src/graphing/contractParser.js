
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
 * @param  {number} mode         determines the kind of data returned
 *                               0: the complete ABI
 *                               1: constructor parameters only
 * @return {object}              the elements for a Cytoscape graph
 */
export default function parseContract (contract, mode) {

  const graph = {...graphTemplate}
  graph.name = contract.contractName
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
  const contractNode = {
    data: {
      id: contractName,
      nodeName: getFormattedName(contractName),
    },
    position: {x: 0, y: 0},
  }

  switch (mode) {
    case 0:
      contractNode.data.type = 'contract:completeAbi'
      abi.forEach(entry => nodes.push(getNodeAll(contractName, entry)))
      break
    case 1:
      contractNode.data.type = 'contract:constructor'
      nodes = nodes.concat(getConstructorNodes(contractName, abi))
      break
    default:
      throw new Error('getNodes: invalid mode')
  }

  nodes.push(contractNode)

  return nodes
}

/**
 * [getNodeAll description]
 * @param  {[type]} contractName [description]
 * @param  {[type]} entry        [description]
 * @return {[type]}              [description]
 */
function getNodeAll (contractName, entry) {

  if (!(entry.type === 'function') &&
    !(entry.type === 'constructor') &&
    !(entry.type === 'event')) {
    throw new Error('Invalid abi entry type:\n\n' + util.inspect(entry, {showHidden: false, depth: null}) + '\n')
  }

  const data = { abi: {} }
  if (entry.type === 'constructor') {
    data.id = contractName + ':constructor'
    data.nodeName = 'Constructor'
  } else {
    if (!entry.name) throw new Error('getNode: invalid ABI entry: missing name')
    data.id = contractName + ':' + entry.name
    data.nodeName = getFormattedName(entry.name)
  }
  data.parent = contractName
  entry.type ? data.type = entry.type : data.type = 'function' // abi type defaults to function if omitted

  data.abi = Object.assign(data.abi, entry) // abi may or may not have the type property

  return {
    data: data,
    position: { x: 0, y: 0}, // placeholder
  }
}

/**
 * [getConstructorNodes description]
 * @param  {[type]} contractName [description]
 * @param  {[type]} abi          [description]
 * @return {[type]}              [description]
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
      position: {x: 0, y: 0}, // placeholder
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

// for testing
// const StandardERC20 = require('chain-end').contracts.StandardERC20
// const testGraph = parseContract(StandardERC20, 1)
// console.log(util.inspect(testGraph.config.elements, {showHidden: false, depth: null}))
