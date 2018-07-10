
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
function parse(contractJSON) {
  return {
    nodes: getNodes(contractJSON.contractName, contractJSON.abi),
    edges: getEdges(contractJSON.contractName, contractJSON.abi)
  }
}

function getNodes(contractName, abiJSON) {
  
  let nodes = []

  // contract node (parent of all others)
  nodes.push({data: { id: contractName}, position: {x: 0, y: 0}})

  for (let entry of abiJSON) {
    nodes.push(getNode(contractName, entry))
  }

  return nodes
}

function getNode(contractName, entry) {

  if ( !(entry.type === 'function') 
    && !(entry.type === 'constructor')
    && !(entry.type === 'event')  ) {
    throw new Error('Invalid abi entry type:\n\n' + util.inspect(entry, {showHidden: false, depth: null}) + '\n')
  }

  let data = { abi: {} }
  if (entry.type === 'constructor') {
    data.id = 'constructor'
  } else {
    if (!entry.name) throw new Error('getNode: invalid ABI entry: missing name')
    data.id = entry.name
  }
  data.parent = contractName
  entry.type ? data.abi.type = entry.type : 'function' // type defaults to function if omitted

  data.abi = Object.assign(data.abi, entry)

  return {
    data: data,
    position: { x: 0, y: 0}
  }
}

// these two may be more complicated
function getEdges(abiJSON) {
  // TODO
  return {}
}

function getEdge(param) {
  // TODO
}


// const StandardERC20_JSON = require('./dev-temp/StandardERC20.json')
// const elements = getElements(StandardERC20_JSON)
// console.log(util.inspect(elements, {showHidden: false, depth: null}))

module.exports = parse
