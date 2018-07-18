
/**
 * TODO
 * 1. Parse contract ABI -- DONE (just use it)
 * 1a. Generate nodes -- DONE
 * 1b. Generate edges
 * 2. Parse queried information
 * Relevant: https://solidity.readthedocs.io/en/develop/abi-spec.html#JSON
 */

const util = require('util')

/**
 * Parses a compiled Solidity contract for use in a Cytoscape graph
 * @param  {object} contractJSON the compiled contract to parse
 * @return {object}              the elements for a Cytoscape graph
 */
export default function parseContract (contractJSON, mode) {
  return {
    nodes: getNodes(contractJSON.contractName, contractJSON.abi, mode),
    edges: getEdges(contractJSON.contractName, contractJSON.abi, mode),
  }
}

function getNodes (contractName, abi, mode) {

  let nodes = []

  // contract node (parent of all others)
  const contractNode = {
    data: {
      id: contractName,
      name: getFormattedName(contractName),
    },
    position: {x: 0, y: 0},
  }

  switch (mode) {
    case 0:
      contractNode.data.type = 'contract_completeAbi'
      abi.forEach(entry => nodes.push(getNodeAll(contractName, entry)))
      break
    case 1:
      contractNode.data.type = 'contract_constructor'
      nodes = nodes.concat(getConstructorNodes(contractName, abi))
      break
    default:
      throw new Error('getNodes: invalid mode')
  }

  nodes.push(contractNode)

  return nodes
}

function getNodeAll (contractName, entry) {

  if (!(entry.type === 'function') &&
    !(entry.type === 'constructor') &&
    !(entry.type === 'event')) {
    throw new Error('Invalid abi entry type:\n\n' + util.inspect(entry, {showHidden: false, depth: null}) + '\n')
  }

  const data = { abi: {} }
  if (entry.type === 'constructor') {
    data.id = contractName + ':constructor'
    data.name = 'Constructor'
  } else {
    if (!entry.name) throw new Error('getNode: invalid ABI entry: missing name')
    data.id = contractName + ':' + entry.name
    data.name = getFormattedName(entry.name)
  }
  data.parent = contractName
  entry.type ? data.type = entry.type : data.type = 'function' // abi type defaults to function if omitted

  data.abi = Object.assign(data.abi, entry) // abi may or may not have the type property

  return {
    data: data,
    position: { x: 0, y: 0}, // placeholder
  }
}

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
        name: getFormattedName(input.name),
        parent: contractName,
        type: 'parameter',
        abi: input,
      },
      position: {x: 0, y: 0}, // placeholder
    })
  }

  return inputNodes
}

function getEdges (abiJSON) {
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

// const StandardErc20Json = require('chain-end').contracts.StandardERC20
// const elements = parse(StandardErc20Json, 1)
// console.log(util.inspect(elements, {showHidden: false, depth: null}))
