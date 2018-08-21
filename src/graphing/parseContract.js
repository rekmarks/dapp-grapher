
const graphTypes = {
  // completeAbi: 'contract:completeAbi',
  _constructor: 'contract:constructor',
  functions: 'contract:functions',
}

export {
  graphTypes as contractGraphTypes,
}

/**
 * Parses a Soldity contract ABI to a legible format for use in visual graphs
 * @param  {object} contract     the compiled contract to parse
 * @param  {number} mode         determines the kind of data returned,
 *                               with the contract as a compound node
 *                               containing:
 *                                 1  constructor parameters
 *                                 2  functions and their parameters (excluding constructor)
 * @return {object}              a graph
 */
export default function parseContract (contract, mode) {

  const graph = {}
  graph.name = contract.contractName
  switch (mode) {
    // case 0:
    //   graph.type = graphTypes.completeAbi
    //   break
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
  graph.elements = {
    nodes: getNodes(contract.contractName, contract.abi, mode),
    edges: getEdges(contract.contractName, contract.abi, mode), // currently a placeholder
  }
  return graph
}

/**
 * GRAPH ELEMENT GETTERS
 */

/**
 * Gets node
 * @param  {[type]} contractName [description]
 * @param  {[type]} abi          [description]
 * @param  {[type]} mode         [description]
 * @return {[type]}              [description]
 */
function getNodes (contractName, abi, mode) {

  let nodes

  // contract node (parent of all others)
  // parent nodes don't have positions; their position is a function
  // of their children's positions
  const contractNode = {
    id: contractName,
    abiName: contractName,
    displayName: getFormattedName(contractName),
  }

  switch (mode) {

    // case 0:
    //   contractNode.type = 'contract'
    //   contractNode.contractType = 'complete'
    //   nodes = getCompleteAbiNodes(contractName, abi)
    //   break

    case 1:
      contractNode.type = 'contract'
      contractNode.contractType = 'constructor'
      nodes = getConstructorNodes(contractName, abi)
      break

    case 2:
      contractNode.type = 'contract'
      contractNode.contractType = 'functions'
      nodes = getFunctionNodes(contractName, abi)
      break

    default:
      throw new Error('getNodes: invalid mode')
  }

  nodes[contractName] = contractNode

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
  if (filtered.length !== 1) {
 throw new Error(
      'getNodeConstructor: invalid abi (no or multiple constructors)'
    )
}

  const constructorAbi = filtered[0]

  // in case of parameter-less constructor
  if (!constructorAbi.inputs || constructorAbi.inputs.length < 1) return {}

  const inputNodes = {}
  for (const input of constructorAbi.inputs) {

    const inputId = contractName + ':constructor:' + input.name

    inputNodes[inputId] = {
      id: inputId,
      displayName: getFormattedName(input.name),
      abiName: input.name,
      abiType: input.type,
      parent: contractName,
      type: 'parameter',
      // abi: input,
    }
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

  const nodes = {}

  functionsAbi.forEach(entry => {

    if (!entry.name) { throw new Error('getFunctionNodes: invalid ABI entry: missing name') }

    const functionId = contractName + ':' + entry.name

    // add function node
    const functionNode = {
      id: functionId,
      displayName: getFormattedName(entry.name),
      abiName: entry.name,
      parent: contractName,
      type: 'function',
      abi: entry,
    }

    if (entry.inputs && entry.inputs.length > 0) functionNode.inputNodes = []
    if (entry.outputs && entry.outputs.length > 0) functionNode.outputNodes = []
    nodes[functionId] = functionNode // add function node

    // add input nodes (if any)
    if (entry.inputs) {
      entry.inputs.forEach((input, i) => {

        const inputId = functionId + ':input:' + input.name
        functionNode.inputNodes.push(inputId)

        nodes[inputId] = {
          id: inputId,
          displayName: getFormattedName(input.name),
          abiName: input.name,
          abiType: input.type,
          parent: functionId,
          type: 'parameter',
          paramOrder: i,
        }
      })
    }

    // add output nodes (if any)
    if (entry.outputs) {
      entry.outputs.forEach(output => {

        const outputId = functionId + ':output:' + output.type
        functionNode.outputNodes.push(outputId)

        nodes[outputId] = {
          id: outputId,
          displayName: output.type,
          abiName: output.name,
          abiType: output.type,
          parent: functionId,
          type: 'output',
        }
      })
    }
  })

  return nodes
}

function getEdges (abi) {
  // TODO
  return {}
}

// function getEdge(param) {
//   // TODO
// }

/**
 * Gets all nodes for a smart contract graph from its ABI, including events,
 * functions, and the constructor
 * @param  {string} contractName the name of the contract being parsed
 * @param  {object} abi          the ABI of the contract being parsed
 * @return {array}               an array of node objects
 */
// function getCompleteAbiNodes (contractName, abi) {

//   const contractInterfaceNodes = []
//   const eventsId = contractName + '::Events'
//   const functionsId = contractName + '::Functions'
//   let hasFunctions = false; let hasEvents = false

//   abi.forEach(entry => {
//     if (!(entry.type === 'function') &&
//       !(entry.type === 'constructor') &&
//       !(entry.type === 'event')) {
//       throw new Error('Invalid abi entry type:\n\n' + util.inspect(
//         entry, {showHidden: false, depth: null}
//         ) + '\n'
//       )
//     }

//     const data = { abi: {} }
//     if (entry.type === 'constructor') {
//       data.id = contractName + ':constructor'
//       data.displayName = 'Constructor'
//       data.type = 'constructor'
//       data.parent = contractName
//     } else {
//       if (!entry.name) throw new Error('getNode: invalid ABI entry: missing name')
//       data.id = contractName + ':' + entry.name
//       data.abiName = entry.name
//       data.displayName = getFormattedName(entry.name)
//       data.type = entry.type ? entry.type : 'function' // abi type defaults to function if omitted
//       data.parent = data.type === 'event' ? eventsId : functionsId
//     }

//     if (!hasEvents) hasEvents = data.parent === eventsId
//     if (!hasFunctions) hasFunctions = data.parent === functionsId

//     data.abi = Object.assign(data.abi, entry) // abi may or may not have the type property

//     contractInterfaceNodes.push({
//       data: data,
//       // some layouts allegedly require non-zero and/or non-overlapping positions
//       position: { x: Math.random(), y: Math.random()},
//     })
//   })

//   if (hasEvents) {
//     contractInterfaceNodes.push({
//       data: {
//         id: contractName + '::Events', // extra colon to ensure no collisions
//         displayName: 'Events',
//         parent: contractName,
//         type: 'ui',
//       },
//     })
//   }
//   if (hasFunctions) {
//     contractInterfaceNodes.push({
//       data: {
//         id: contractName + '::Functions', // extra colon to ensure no collisions
//         displayName: 'Functions',
//         parent: contractName,
//         type: 'ui',
//       },
//     })
//   }

//   return contractInterfaceNodes
// }

/**
 * HELPERS
 */

function getFormattedName (name) {
  const formattedName = name.substring(name.search(/[a-z]/i)) // regex: /i indicates ignorecase
  return formattedName.charAt(0).toUpperCase() + formattedName.slice(1)
}
