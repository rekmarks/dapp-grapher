
import joint from 'jointjs'
import uuid from 'uuid/v4'

import { contractGraphTypes } from './graphGenerator'
import exampleGraphs from '../temp/graphExamples.js' // TODO: temp

/**
 * CONFIG
 */

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
      // tbd?
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

const linkConfig = {
  wrapper: {
    strokeWidth: 25,
  },
}

/**
 * EXPORT
 */

const jointHelper = {
  config: {
    paper: paperConfig,
    link: linkConfig,
  },
  elements: {
    connect,
    setLayout,
    getAttribute: getCustomAttributeFromView,
    setAttribute: setCustomAttributeInView,
  },
  setDummyElements,
  addJointElements,
  paper: {
    addEventHandlers: addPaperEventHandlers,
    initialize: initializePaper,
  },
}

export default jointHelper

/**
 * MODEL GETTERS AND SETTERS
 */

/**
 * [addJointElements description]
 * @param {[type]} jointGraph [description]
 * @param {[type]} dappGraph  [description]
 * @param {[type]} meta       [description]
 */
function addJointElements (jointGraph, dappGraph, meta) {

  const graphNodes = dappGraph.elements.nodes

  let cells
  switch (dappGraph.type) {

    case contractGraphTypes._constructor:
      cells = generateConstructorElement(dappGraph.name, graphNodes)
      break

    case contractGraphTypes.functions:
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

    case 'dapp':
      setDappCells(jointGraph, dappGraph, meta)
      return

    default:
      throw new Error('unknown graph type')
  }

  jointGraph.addCells(cells)
  if (meta.setsLayout) setLayout(jointGraph, meta.layoutOptions)
}

function generateAccountElement (accountNode, accountChildren) {

  const displayName = accountNode.displayName

  const accountElement = generateAtomic(
    displayName,
    {
      size: { width: 50, height: 50 },
      _dappGrapher: {
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
 * [generateConstructorElement description]
 * @param  {[type]} dappGraph [description]
 * @return {[type]}           [description]
 */
function generateConstructorElement (graphName, graphNodes) {

  const ioNodes = Object.values(graphNodes)
    .filter(node => node.type === 'parameter' || node.type === 'output')

  const constructorNode = Object.values(graphNodes)
    .filter(node => node.type === contractGraphTypes._constructor)[0]

  const contractElement = generateAtomic(
    graphName,
    {
      size: { width: 175, height: 100 },
      _dappGrapher: {
        contractName: constructorNode.abiName,
        id: constructorNode.id,
        type: constructorNode.type,
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
 * [setDappCells description]
 * @param {[type]} jointGraph [description]
 * @param {[type]} dappGraph  [description]
 * @param {[type]} meta       [description]
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
    return node.type === contractGraphTypes._constructor
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
 * [generateFunctionsElements description]
 * @param  {[type]} dappGraph [description]
 * @return {[type]}           [description]
 */
function generateFunctionsElements (dappGraph) {

  const contractElement = generateCoupled(
    dappGraph.name,
    { type: dappGraph.type }
  )

  const allNodes = Object.values(dappGraph.elements.nodes)
  const functionNodes = allNodes.filter(node => node.type === 'function')

  const functionElements = functionNodes.map(node => {

    const ioNodes = allNodes.filter(n => n.parent === node.id)

    const funcElement = generateAtomic(
      node.displayName,
      {
        size: { width: 175, height: 100 },
        _dappGrapher: {
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

function generateCoupled (displayName, props = {}) {

  const coupled = new joint.shapes.devs.Coupled({
    _dappGrapher: { ...props },
  })
  coupled.attr({
    text: { text: displayName, fill: 'black'},
    '.body': {
      'rx': 6,
      'ry': 6,
    },
  })
  return coupled
}

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
    // atomic.attributes.ports.groups.in.position.name = 'top'
    // atomic.attributes.ports.groups.in.label.position.name = 'top'
    // atomic.attributes.ports.groups.in.label.position.args.y = -10
    const ports = generatePorts(ioNodes, true)
    ports.forEach(port => {
      if (port.type === 'in') atomic.addInPort(port.name, port.opts)
      else atomic.addOutPort(port.name, port.opts)
    })
  }

  return atomic
}

function generatePorts (ioNodes, isInOut = false) {

  const ports = []

  if (ioNodes) {

    ioNodes.forEach(node => {

      if (node.type !== 'parameter' && node.type !== 'output') {
        throw new Error('invalid port node; neither parameter nor output')
      }

      const typeProp = node.type === 'output' ? 'out' : 'in'

      let props
      if (isInOut) {
        props = {
          type: typeProp,
          name: node.displayName,
        }
      } else {
        props = {
          group: typeProp,
          attrs: { text: { text: node.displayName } },
        }
      }

      ports.push({
        opts: {
          _dappGrapher: {
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

function getDefaultLink () {
  const link = new joint.shapes.standard.Link({
    _dappGrapher: {},
  })
  link.attr(linkConfig)
  return link
}

/**
 * PAPER AND GRAPH MANIPULATORS
 */

function initializePaper (jointElement, jointGraph, eventHandlers) {

  const paper = new joint.dia.Paper({
    ...paperConfig,
    el: jointElement,
    model: jointGraph,
  })
  paper._dappGrapher = {
    panning: false,
  }

  paper.scale(0.8)

  addPaperEventHandlers(paper, eventHandlers)

  return paper
}

function addPaperEventHandlers (paper, handlers) {

  // open contract form
  paper.on('element:pointerdblclick', (view, evt, x, y) => {

    console.log(view.model)

    const nodeType = getCustomAttributeFromView(view, 'type')

    if (!nodeType) {
      console.warn('joint element missing type')
      return
    }

    if (Object.values(contractGraphTypes).includes(nodeType)) {

      handlers.openForm(getCustomAttributeFromView(view, 'id'))

    } else if (nodeType === 'ui') {
      // do nothing
    } else {
      console.warn('unhandled node type: ' + nodeType)
    }
  })

  // when a link is added
  paper.on('link:connect', linkView => {

    const link = linkView.model

    // if there's an id, we don't want it
    if (link.attributes._dappGrapher.id) return

    const linkId = uuid()

    link.attributes._dappGrapher.id = linkId

    const edge = {}

    edge.id = link.attributes._dappGrapher.id

    const source = link.getSourceElement()
    const target = link.getTargetElement()

    edge.sourceParent = source.attributes._dappGrapher.id
    edge.targetParent = target.attributes._dappGrapher.id

    edge.sourceName = link.attributes.source.port
    edge.targetName = link.attributes.target.port

    handlers.addEdge(edge)
  })

  // link removal
  paper.on('link:pointerdblclick', linkView => {

    handlers.removeEdge(linkView.model.attributes._dappGrapher.id)
    linkView.model.remove()
  })

  // toggle panning
  paper.on('blank:pointerdblclick', (view, evt) => {

    paper._dappGrapher.panning = !paper._dappGrapher.panning
  })
}

function connect (graph, source, sourcePort, target, targetPort) {

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

  link.addTo(graph).reparent()
}

function setLayout (graph, options = {}) {

  joint.layout.DirectedGraph.layout(graph, {
    setLinkVertices: false,
    rankDir: options.rankDir ? options.rankDir : 'LR', // left to right
    rankSep: 100,
    edgeSep: 25,
    marginX: 300, // TODO: set dynamically
    marginY: 300,
    clusterPadding: { top: 30, left: 30, right: 30, bottom: 30 },
  })
}

/**
 * MISC./HELPERS
 */

/**
 * Gets the value of the _dappGrapher attribute of an element embedded in a
 * view, as returned from a click handler
 * @param  {cellView} view  the CellView (or child class thereof)
 * @param  {?}        key   the key of the attribute to be retrieved, or null
 * @return {?}              the value of the attribute, all dappGrapher
 *                          attributes (if key=null), or undefined
 */
function getCustomAttributeFromView (view, key = null) {
  return key ? view.model.attributes._dappGrapher[key]
    : view.model.attributes._dappGrapher
}

/**
 * Sets the value of the _dappGrapher attribute of an element embedded in a
 * view, as returned from a click handler.
 *
 * @param  {cellView} view  the CellView (or child class thereof)
 * @param  {?}        key   the key of the attribute to be set
 * @param  {?}        value the value to be set
 */
function setCustomAttributeInView (view, key = null, value = null) {
  if (key) view.model.attributes._dappGrapher[key] = value
}

/**
 * Generates a dummy graph for testing/experimental purposes
 * @param  {object} jointGraph the target joint graph object
 */
function setDummyElements (jointGraph) {

  const rect = new joint.shapes.devs.Model({
    position: { x: 100, y: 30 },
    size: { width: 150, height: 75 },
    // attrs: {},
  })

  rect.addOutPort('out')
  const rect2 = rect.clone()
  rect2.translate(300, 0)
  // rect2.attr('text/text', 'World!')

  rect2.addInPort('in')

  const rect3 = rect2.clone()
  rect3.translate(0, 150)
  rect3.addOutPort('out')

  const coupled1 = new joint.shapes.devs.Coupled({
    position: { x: 700, y: 150 },
    size: { width: 300, height: 150 },
  })
  coupled1.attr({
    '.body': {
      'rx': 6,
      'ry': 6,
    },
  })

  const atom1 = new joint.shapes.devs.Atomic({
    position: { x: 700, y: 75 },
    size: { width: 150, height: 75 },
  })
  const atom2 = atom1.clone()
  atom2.translate(0, 150)

  atom1.addOutPort('out')
  atom1.addInPort('in')

  atom2.addInPort('in')

  const moarNodes = generateConstructorElement(exampleGraphs._constructor)

  const cells = [coupled1, rect, rect2, rect3, atom1, atom2].concat(moarNodes)
  // coupled cells must be added before embedded cells or the latter end up on the bottom
  jointGraph.addCells(cells) // replace with generateJointJSX

  coupled1.embed(atom1)
  coupled1.embed(atom2)
  // coupled1.fitEmbeds({padding: 50})

  connect(jointGraph, rect, 'out', rect2, 'in')
  connect(jointGraph, rect3, 'out', atom1, 'in')
  connect(jointGraph, rect2, 'out', rect3, 'in')
  connect(jointGraph, rect, 'out', atom2, 'in')

  setLayout(jointGraph)
}
