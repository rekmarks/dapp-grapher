
/**
 * TODO
 * NOTE: This entire file will be refactored to use graphlib. Don't bother
 * trying to making sense of it.
 */

import { getDisplayAddress } from '../utils'

const graphTypes = {
  contract: {
    _constructor: 'contract:constructor',
    functions: 'contract:functions',
  },
  dapp: {
    template: 'dapp:template',
    deployed: 'dapp:deployed',
  },
}

export default getContractGraph
export {
  graphTypes,
  getAccountGraph,
  getDeployedDappGraph,
}

/**
 * GRAPH GETTERS
 */

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
function getContractGraph (contract, mode) {

  const graph = {}
  graph.name = contract.contractName
  switch (mode) {
    case 1:
      graph.type = graphTypes.contract._constructor
      break
    case 2:
      graph.type = graphTypes.contract.functions
      break
    default:
      throw new Error('invalid mode: ' + mode)
  }
  graph.id = graph.name + ':' + graph.type
  graph.elements = {
    nodes: getContractNodes(contract.contractName, contract.abi, mode),
    edges: getContractEdges(contract.contractName, contract.abi, mode), // currently a placeholder
  }
  return graph
}

/**
 * [getAccountGraph description]
 * @param  {[type]} address [description]
 * @return {[type]}         [description]
 */
function getAccountGraph (address) {

  return {
    id: 'account',
    type: 'account',
    elements: {
      nodes: {
        account: {
          id: 'account',
          displayName: 'Account',
          type: 'ui',
        },
        'account:address': {
          id: 'account:address',
          address: address,
          displayName: getDisplayAddress(address),
          parent: 'account',
          type: 'output',
          abiType: 'address',
        },
      },
      edges: {},
    },
  }
}

/**
 * Converts a template dapp graph into a deployed dapp graph for use with
 * a deployed dapp
 *
 * TODO: this conversion is at best perfunctory. It merely replaces contract
 * address output port labels with the addresses of those contracts. Make this
 * far more distinct from template graphs.
 *
 * @param {string} deployedGraphId the id to be given to the deployed dapp's
 * graph
 * @param {object} templateGraph the template's dapp graph
 * @param {array} deployedContracts the deployed contract instances associated
 * with the deployed dapp
 * @return {object} the graph of the deployed dapp
*/
function getDeployedDappGraph (
  deployedGraphId,
  templateGraph,
  deployedContracts
) {

  const deployedGraph = { ...templateGraph }

  deployedGraph.type = graphTypes.dapp.deployed
  deployedGraph.id = deployedGraphId

  const nodes = Object.values(deployedGraph.elements.nodes)
  // const sourceNodes = Object.values(deployedGraph.elements.edges).map(
  //   edge => edge.source
  // )

  // filter out contract nodes and add the instanceAddress property
  nodes.filter(

    node => Object.values(graphTypes.contract).includes(node.type)

  ).forEach(node => {

    node.instanceAddress = Object.values(deployedContracts).find(
      instance => instance.templateNodeId === node.id
    ).address
  })

  // relabel address outputs of contract nodes
  nodes.forEach(node => {

    if (node.type === 'output') {

      if (node.abiType === 'address' && node.parent !== 'account') {

        node.displayName = getDisplayAddress(
          deployedGraph.elements.nodes[node.parent].instanceAddress
        )
      }
    }
  })

  return deployedGraph
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
function getContractNodes (contractName, abi, mode) {

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

    case 1:
      contractNode.type = graphTypes.contract._constructor
      contractNode.abiType = 'constructor'
      nodes = getConstructorNodes(contractName, abi)
      break

    case 2:
      contractNode.type = graphTypes.contract.functions
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

  const nodes = {}
  constructorAbi.inputs.forEach((input, i) => {

    const inputId = contractName + ':constructor:' + input.name

    nodes[inputId] = {
      id: inputId,
      displayName: getFormattedName(input.name),
      abiName: input.name,
      abiType: input.type,
      parent: contractName,
      type: 'parameter',
      paramOrder: i,
    }
  })

  // constructor output node
  const outputId = contractName + ':constructor:instance'
  nodes[outputId] = {
    id: outputId,
    displayName: 'Deployed Address',
    abiType: 'address',
    parent: contractName,
    type: 'output',
  }

  return nodes
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

function getContractEdges (abi) {
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
  // regex: /i indicates ignorecase
  const formattedName = name.substring(name.search(/[a-z]/i))
  return formattedName.charAt(0).toUpperCase() + formattedName.slice(1)
}
