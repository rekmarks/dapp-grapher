
/**
 * TODO
 * NOTE: This file will change significantly with the graphlib refactor.
 * Do not modify until that refactor is complete.
 */

import joint from 'jointjs'
import uuid from 'uuid/v4'

import { graphTypes } from './graphGenerator'

/**
 * CONFIG
 */

// config of the joint paper, essentially the SVG canvas
const paperConfig = {
  width: 1, // arbitrary positive
  height: 1, // arbitrary positive
  gridSize: 10,
  snapLinks: true,
  linkPinning: false,
  embeddingMode: true,
  background: {
    color: '#F8F8F8',
  },
  defaultRouter: {
    name: 'metro',
    args: {
      // TODO: determine whether improvements can be made
    },
  },
  defaultConnector: {
    name: 'rounded',
    args: {
      radius: 2.5,
    },
  },
  defaultLink: getDefaultLink(),
  validateEmbedding: function (childView, parentView) {
    return parentView.model instanceof joint.shapes.devs.Coupled
  },
  validateConnection: function (sourceView, sourceMagnet, targetView, targetMagnet) {
    // TODO: make robust
    return sourceMagnet !== targetMagnet
  },
}

// config of links, i.e. edges
const linkConfig = {
  wrapper: {
    strokeWidth: 25, // extends clickable part of links beyond visible body
  },
}

/**
 * EXPORT
 */

export {
  setJointElements,
  initializeJointPaper,
}

/**
 * MODEL GETTERS AND SETTERS
 */

/**
 * Sets Joint elements of jointGraph per the graph type of dappGraph. For use
 * with single-contract or account graphs only. See setDappCells for full
 * dapp graphs.
 *
 * @param {object} jointGraph  the Joint graph the elements will be added to
 * @param {object} dappGraph  the non-Joint graph representing the dapp
 * @param {object} meta  options for e.g. setsLayout
 */
function setJointElements (jointGraph, dappGraph, meta) {

  const graphNodes = dappGraph.elements.nodes

  if (Object.values(graphTypes.dapp).includes(dappGraph.type)) {

    setDappCells(jointGraph, dappGraph, meta)
    return
  }

  let cells
  switch (dappGraph.type) {

    case graphTypes.contract._constructor:
      cells = generateConstructorElement(dappGraph.name, graphNodes)
      break

    case graphTypes.contract.functions:
      cells = generateFunctionsElements(dappGraph)
      break

    case 'account':
      cells = generateAccountElement(
        graphNodes.account,
        Object.values(graphNodes).filter(node => {
          return node.parent === 'account'
        })
      )
      break

    default:
      throw new Error('unknown graph type')
  }

  jointGraph.addCells(cells)
  if (meta.setsLayout) setLayout(jointGraph, meta.layoutOptions)
}

/**
 * Generates the Joint element representing the current account node
 *
 * @param {object} accountNode  the non-Joint graph node representing the current account
 * @param {object} accountChildren  the children of the account node
 * @returns {object} the Joint element representing the current account node
 */
function generateAccountElement (accountNode, accountChildren) {

  const displayName = accountNode.displayName

  const accountElement = generateAtomic(
    displayName,
    {
      size: { width: 50, height: 50 },
      dappGrapher: {
        id: accountNode.id,
        type: accountNode.type,
      },
    },
    {
      '.body': { 'rx': 90, 'ry': 90},
      '.label': { 'text-anchor': 'middle', 'ref-x': 22.5, 'ref-y': -20 },
    },
    accountChildren
  )
  return accountElement
}

/**
 * Generates the default Joint element corresponding to a contstructor node
 *
 * @param {object} graphName the name of the parent non-Joint graph
 * @param {object} graphNodes the nodes of the parent non-Joint graph
 * @return {object} the generated Joint element
 */
function generateConstructorElement (graphName, graphNodes) {

  const ioNodes =
    Object.values(graphNodes)
    .filter(node => node.type === 'parameter' || node.type === 'output')
    .sort((a, b) => {

      if (a.type === 'output') return 1
      if (b.type === 'output') return -1

      return a.paramOrder - b.paramOrder
    })

  const constructorNode = Object.values(graphNodes)
    .filter(node => node.type === graphTypes.contract._constructor)[0]

  const contractElement = generateAtomic(
    graphName,
    {
      size: { width: 175, height: 100 },
      dappGrapher: {
        contractName: constructorNode.abiName,
        id: constructorNode.id,
        type: constructorNode.type,
        instanceAddress: constructorNode.instanceAddress,
      },
    },
    {
      '.label': { 'text-anchor': 'middle', 'ref-y': 40 },
      '.body': { 'rx': 10, 'ry': 10 },
    },
    ioNodes
  )

  return contractElement
}

/**
 * Sets elements (shapes/nodes) and links (edges) - collectively cells - of a
 * dapp graph with account and contract nodes.
 *
 * @param {object} jointGraph the Joint graph that the cells will be added to
 * @param {object} dappGraph the non-Joint graph of the dapp
 * @param {object} meta object with options for e.g. setsLayout
 */
function setDappCells (jointGraph, dappGraph, meta) {

  const cells = []

  const graphNodes = dappGraph.elements.nodes
  const graphEdges = dappGraph.elements.edges

  const idMapping = {}

  // get account element
  const accountNode = Object.values(graphNodes).filter(node => {
    return node.id === 'account'
  })[0]

  const accountChildren = Object.values(graphNodes).filter(node => {
    return node.parent === 'account'
  })

  const accountElement = generateAccountElement(accountNode, accountChildren)

  idMapping[accountNode.id] = accountElement.id

  cells.push(accountElement)

  // get constructor elements
  const constructorNodeIds = Object.values(graphNodes).filter(node => {
    return node.type === graphTypes.contract._constructor
  }).map(node => node.id)

  constructorNodeIds.forEach(constructorId => {

    const contractElements = {}

    Object.values(graphNodes).forEach(node => {
      if (node.id === constructorId || node.parent === constructorId) {
        contractElements[node.id] = { ...node }
      }
    })

    const constructorElement = generateConstructorElement(
      graphNodes[constructorId].displayName,
      contractElements
    )

    idMapping[constructorId] = constructorElement.id

    cells.push(constructorElement)
  })

  // add elements (nodes) to graph
  jointGraph.addCells(cells)

  // get and add links to Joint graph per dapp graph edges
  Object.values(graphEdges).forEach(edge => {
    connect(
      jointGraph,
      jointGraph.getCell(idMapping[edge.sourceParent]),
      graphNodes[edge.source].displayName,
      jointGraph.getCell(idMapping[edge.targetParent]),
      graphNodes[edge.target].displayName,
    )
  })

  if (meta.setsLayout) setLayout(jointGraph)
}

/**
 * Generates the Joint elements corresponding to a complete ABI graph, i.e. a
 * Solidity contract and all its functions.
 *
 * TODO: This visualization is unwieldy to say the least and should either
 *       be improved or deprecated. It is currently not used.
 *
 * @param {object} dappGraph the graph which will be visualized using Joint
 * @returns {array} the elements of the generated Joint graph
 */
function generateFunctionsElements (dappGraph) {

  // the contract element is a compound node
  const contractElement = generateCoupled(
    dappGraph.name,
    { type: dappGraph.type }
  )

  const allNodes = Object.values(dappGraph.elements.nodes)
  const functionNodes = allNodes.filter(node => node.type === 'function')

  // generate function elements and their ports from the function nodes and
  // their respective input nodes
  const functionElements = functionNodes.map(node => {

    const ioNodes = allNodes.filter(n => n.parent === node.id).sort((a, b) => {

      // there's only a single output so make it last
      if (a.type === 'output') return 1
      if (b.type === 'output') return -1

      // display input ports in their ABI order
      return a.paramOrder - b.paramOrder
    })

    const funcElement = generateAtomic(
      node.displayName,
      {
        size: { width: 175, height: 100 },
        dappGrapher: {
          id: node.id,
          abiName: node.abiName,
          abiType: node.abiType,
        },
      },
      {
        '.label': { 'text-anchor': 'middle', 'ref-y': 40 },
        '.body': { 'rx': 10, 'ry': 10 },
      },
      ioNodes.length > 0 ? ioNodes : null
    )
    contractElement.embed(funcElement)
    return funcElement
  })

  return [contractElement].concat(functionElements)
}

/**
 * ELEMENT FACTORIES
 */

/**
 * Generates a Coupled shape, an element which can embed Atomic shapes to
 * create compound nodes.
 *
 * @param {string} displayName the visual name of the element
 * @param {object} props properties of the element initialized through its constructor
 * @returns {object} the generated Coupled element
 */
function generateCoupled (displayName, props = {}) {

  const coupled = new joint.shapes.devs.Coupled({
    dappGrapher: { ...props },
  })
  coupled.attr({
    text: { text: displayName, fill: 'black'},
    '.body': {
      'rx': 6, // rounded corners
      'ry': 6, // rounded corners
    },
  })
  return coupled
}

/**
 * Generates an Atomic shape, an element which can be embedded in a Coupled
 * shape to create compound nodes.
 *
 * @param {string} displayName the visual name of the element
 * @param {object} constructorProps properties of the element best initialized through its constructor
 * @param {object} attributes properties of the elements best set after its instantiation
 * @param {array} ioNodes an array of non-joint graph nodes representing the element's inputs and outputs
 * @return {object} the generated Atomic element
 */
function generateAtomic (
  displayName,
  constructorProps = {},
  attributes = {},
  ioNodes = null
) {

  const atomic = new joint.shapes.devs.Atomic({
    ...constructorProps,
  })
  atomic.attr({
    text: { text: displayName, fill: 'black'},
    ...attributes,
  })

  if (ioNodes) {
    const ports = generatePorts(ioNodes, true)
    ports.forEach(port => {
      if (port.type === 'in') atomic.addInPort(port.name, port.opts)
      else atomic.addOutPort(port.name, port.opts)
    })
  }

  return atomic
}

/**
 * Generates the ports for a Joint element from the dapp/contract graph nodes
 * representing the inputs and outputs of a contract.
 *
 * Links attach to ports, which belong to some parent element.
 *
 * @param {array} ioNodes array of non-joint graph nodes
 * @param {boolean} isInOut=false some Joint shapes have in/out ports, others just ports
 * @returns {array} array of Joint port objects for a single Joint element
 */
function generatePorts (ioNodes, isInOut = false) {

  const ports = []

  if (ioNodes) {

    ioNodes.forEach(node => {

      if (node.type !== 'parameter' && node.type !== 'output') {
        throw new Error('invalid port node; neither parameter nor output')
      }

      // ports are either link/edge sources ('out') or targets ('in')
      const typeProp = node.type === 'output' ? 'out' : 'in'

      // some elements/shapes have different port interfaces
      const props = {}
      if (isInOut) {
        props.type = typeProp
        props.name = node.displayName
      } else {
        props.group = typeProp
        props.attrs = { text: { text: node.displayName } }
      }

      ports.push({
        opts: {
          dappGrapher: {
            id: node.id,
            abiName: node.abiName,
            abiType: node.abiType,
          },
        },
        ...props,
      })
    })
  }

  return ports
}

/**
 * @returns {object} a default skeleton link to be used when new links are
 * added.
 */
function getDefaultLink () {
  const link = new joint.shapes.standard.Link({
    dappGrapher: {},
  })
  link.attr(linkConfig)
  return link
}

/**
 * PAPER AND GRAPH MANIPULATORS
 */

/**
 * Initializes the Joint paper for the given Joint graph.
 *
 * Note: Joint consists of a Joint graph, representing the graph/data to be
 * rendered, and a Joint paper which is essentially the SVG canvas.
 *
 * @param {object} jointElement the parent DOM element
 * @param {object} jointGraph the graph of the joint paper
 * @param {object} eventHandlers event handlers declared in the caller
 * @returns {object} the Joint paper
 */
function initializeJointPaper (jointElement, jointGraph, eventHandlers) {

  const paper = new joint.dia.Paper({
    ...paperConfig,
    el: jointElement,
    model: jointGraph,
  })
  paper.dappGrapher = {
    panning: false, // indicates whether panning is currently enabled
  }

  paper.scale(0.8)

  addPaperEventHandlers(paper, eventHandlers)

  return paper
}

/**
 * Adds necessary event handlers to the joint paper
 *
 * @param {object} paper the joint paper to add event handlers to
 * @param {object} handlers handler functions that must be defined by caller
 */
function addPaperEventHandlers (paper, handlers) {

  // open contract form
  paper.on('element:pointerdblclick', (view, evt, x, y) => {

    // console.log(view.model) // dev/debug

    const node = view.model
    const nodeType = node.attributes.dappGrapher.type

    // all nodes should have a type
    if (!nodeType) {
      console.warn('joint element missing type')
      return
    }

    // contract form only opens if a contract node is clicked
    if (Object.values(graphTypes.contract).includes(nodeType)) {

      handlers.openForm(
        node.attributes.dappGrapher.id,
        node.attributes.dappGrapher.contractName,
        node.attributes.dappGrapher.instanceAddress
      )
    } else if (nodeType === 'ui') {
      // do nothing
    } else {
      console.warn('unhandled node type: ' + nodeType)
    }
  })

  // when a link is added
  paper.on('link:connect', linkView => {

    const link = linkView.model

    // defensive programming: if there's an id, it already exists, so return
    if (link.attributes.dappGrapher.id) return

    // Joint has links
    const linkId = uuid()

    link.attributes.dappGrapher.id = linkId

    // graphs have edges
    const edge = {}

    edge.id = link.attributes.dappGrapher.id

    const source = link.getSourceElement()
    const target = link.getTargetElement()

    edge.sourceParent = source.attributes.dappGrapher.id
    edge.targetParent = target.attributes.dappGrapher.id

    edge.sourceName = link.attributes.source.port
    edge.targetName = link.attributes.target.port

    handlers.addEdge(edge)
  })

  // link removal
  paper.on('link:pointerdblclick', linkView => {

    handlers.removeEdge(linkView.model.attributes.dappGrapher.id)
    linkView.model.remove()
  })

  // toggle panning
  paper.on('blank:pointerdblclick', (view, evt) => {

    paper.dappGrapher.panning = !paper.dappGrapher.panning
  })
}

/**
 * Connects two ports of two elements in a joint graph
 *
 * @param {object} jointGraph the parent joint graph
 * @param {object} source the source element
 * @param {object} sourcePort the out-port of the source element
 * @param {object} target the target element
 * @param {object} targetPort the in-port of the target element
 */
function connect (jointGraph, source, sourcePort, target, targetPort) {

  const link = new joint.shapes.standard.Link({
      source: {
          id: source.id,
          port: sourcePort,
      },
      target: {
          id: target.id,
          port: targetPort,
      },
  })

  link.attr(linkConfig)

  link.addTo(jointGraph).reparent()
}

/**
 * Applies a directed graph (dagre) layout to the given the joint graph per
 * options
 *
 * @param {object} jointGraph the joint graph to set the layout for
 * @param {object} options the options for the layout, if any
 */
function setLayout (jointGraph, options = {}) {

  joint.layout.DirectedGraph.layout(jointGraph, {
    setLinkVertices: false,
    rankDir: options.rankDir ? options.rankDir : 'LR', // left to right
    rankSep: 100,
    edgeSep: 25,
    marginX: 300, // TODO: set dynamically
    marginY: 300,
    clusterPadding: { top: 30, left: 30, right: 30, bottom: 30 },
  })
}

