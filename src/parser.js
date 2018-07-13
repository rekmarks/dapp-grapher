
/**
 * TODO
 * 1. Parse contract ABI -- DONE (just use it)
 * 1a. Generate nodes -- DONE
 * 1b. Generate edges
 * 2. Parse queried information
 * Relevant: https://solidity.readthedocs.io/en/develop/abi-spec.html#JSON
 */

// example nodes and edges
/**
 * elements: {
    nodes: [
      { data: { id: 'a', parent: 'b' }, position: { x: 215, y: 85 } },
      { data: { id: 'b' } },
      { data: { id: 'c', parent: 'b' }, position: { x: 300, y: 85 } },
      { data: { id: 'd' }, position: { x: 215, y: 175 } },
      { data: { id: 'e' } },
      { data: { id: 'f', parent: 'e' }, position: { x: 300, y: 175 } }
    ],
    edges: [
      { data: { id: 'ad', source: 'a', target: 'd' } },
      { data: { id: 'eb', source: 'e', target: 'b' } }

    ]
  },
 */

const util = require('util')

/**
 * Parses a compiled Solidity contract for use in a Cytoscape graph
 * @param  {object} contractJSON the compiled contract to parse
 * @return {object}              the elements for a Cytoscape graph
 */
function parse (contractJSON, mode) {
  return {
    nodes: getNodes(contractJSON.contractName, contractJSON.abi, mode),
    edges: getEdges(contractJSON.contractName, contractJSON.abi, mode),
  }
}

function getNodes (contractName, abi, mode) {

  let nodes = []

  // contract node (parent of all others)
  const contractNode = {data: { id: contractName}, position: {x: 0, y: 0}}

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
  } else {
    if (!entry.name) throw new Error('getNode: invalid ABI entry: missing name')
    data.id = contractName + ':' + entry.name
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

  if (!constructorAbi.inputs || constructorAbi.inputs.length < 1) return []

  const inputNodes = []
  for (const input of constructorAbi.inputs) {
    inputNodes.push({
      data: {
        id: contractName + ':constructor:' + input.name,
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


// const StandardErc20Json = require('./dev-temp/StandardERC20.json')
// const elements = parse(StandardErc20Json, 0)
// console.log(util.inspect(elements, {showHidden: false, depth: null}))

module.exports = parse
