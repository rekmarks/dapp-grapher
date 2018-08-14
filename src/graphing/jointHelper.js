
import joint from 'jointjs'

import { contractGraphTypes } from './parseContract'
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
  setJointElements,
  paper: {
    addEventHandlers: addPaperEventHandlers,
    initialize: initializePaper,
  },
}

export default jointHelper

/**
 * GRAPH GETTERS
 */

function setJointElements (jointGraph, dappGraph) {

  let cells
  switch (dappGraph.type) {

    case contractGraphTypes._constructor:
      cells = generateConstructorElements(dappGraph)
      break

    case contractGraphTypes.functions:
      cells = generateFunctionsElements(dappGraph)
      break

    default:
      throw new Error('unknown graph type')
  }
  jointGraph.addCells(cells)
  setLayout(jointGraph)
}

function generateConstructorElements (dappGraph) {

  const ioNodes = Object.keys(dappGraph.elements.nodes).map(key => {
    return dappGraph.elements.nodes[key]
  }).filter(obj => obj.type === 'parameter' || obj.type === 'output')

  const contractElement = generateCoupled(
    dappGraph.name,
    { type: dappGraph.type }
  )

  const ioCircles = generateIOCircles(ioNodes)

  ioCircles.forEach(circle => contractElement.embed(circle))

  return [contractElement].concat(ioCircles)
}

function generateFunctionsElements (dappGraph) {

  const contractElement = generateCoupled(
    dappGraph.name,
    { type: dappGraph.type }
  )

  const allNodes = Object.values(dappGraph.elements.nodes)
  const functionNodes = allNodes.filter(node => node.type === 'function')

  const functionElements = functionNodes.map(node => {

    const ioNodes = allNodes.filter( n => n.parent === node.id)
    
    const funcElement = generateAtomic(
      node.displayName,
      {
        id: node.id,
        abiName: node.abiName,
        abiType: node.abiType,
      },
      ioNodes.length > 0 ? ioNodes : null
    )
    contractElement.embed(funcElement)
    return funcElement
  })

  return [contractElement].concat(functionElements)
}

/**
 * ELEMENT GENERATORS
 */

function generateCoupled (displayName, props = null) {

  const coupled = new joint.shapes.devs.Coupled({
    _dappGrapher: props ? { ...props } : {},
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

function generateIOCircles (ioNodes) {

  const circles = []

  if (ioNodes) {

    ioNodes.forEach(node => {

      if (node.type !== 'parameter' && node.type !== 'output') { throw new Error('invalid port node; neither parameter nor output') }

      const circle = new joint.shapes.standard.Circle({
        _dappGrapher: {
          id: node.id,
          abiName: node.abiName,
          abiType: node.abiType,
        },
      })
      circle.resize(25, 25)
      circle.attr({
        label: {
          text: node.displayName,
          fill: 'black',
          textAnchor: 'left',
          refX: '125%',
          refY: '55%',
        },
        // TODO: wrap label for layout purposes
        // the below doesn't work
        // outline: {
        //   ref: 'label',
        //   refX: 0,
        //   refY: 0,
        //   refWidth: '100%',
        //   refHeight: '100%',
        //   strokeWidth: 1,
        //   stroke: '#000000',
        //   fill: 'none',
        // },
      })

      circles.push(circle)
  })
}

  return circles
}

function generateAtomic (displayName, nodeProps = null, ioNodes = null) {

  const atomic = new joint.shapes.devs.Atomic({
    size: { width: 75, height: 150 },
    _dappGrapher: nodeProps ? { ...nodeProps } : {},
  })
  atomic.attr({
    text: { text: displayName, fill: 'black'},
  })

  if (ioNodes) {
    // atomic.attributes.ports.groups.in.position.name = 'top'
    // atomic.attributes.ports.groups.in.label.position.name = 'top'
    // atomic.attributes.ports.groups.in.label.position.args.y = -10
    const ports = generatePorts(ioNodes)
    ports.forEach(port => {
      if (port.type === 'in') atomic.addInPort(port.name, port.opts)
      else atomic.addOutPort(port.name, port.opts)
    })
  }

  return atomic
}

function generatePorts (ioNodes) {

  const ports = []

  if (ioNodes) {

    ioNodes.forEach(node => {

      if (node.type !== 'parameter' && node.type !== 'output') {
        throw new Error('invalid port node; neither parameter nor output')
      }

      ports.push({
        name: node.displayName,
        opts: {
          _dappGrapher: {
            id: node.id,
            abiName: node.abiName,
            abiType: node.abiType,
          },
        },
        type: node.type === 'output' ? 'out' : 'in',
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

function initializePaper (jointElement, graph, eventHandlers) {

  const paper = new joint.dia.Paper({
    ...paperConfig,
    el: jointElement,
    model: graph,
  })
  paper._dappGrapher = {
    panning: false,
  }

  paper.scale(0.9)

  addPaperEventHandlers(paper, eventHandlers)

  return paper
}

function addPaperEventHandlers (paper, handlers) {

  // open contract form
  paper.on('element:pointerdblclick', (view, evt, x, y) => {
    
    console.log(view, evt) // dev temp

    const nodeType = getCustomAttributeFromView(view, 'type')

    if (!nodeType) {
      console.warn('joint element missing type')
      return
    }

    if (Object.values(contractGraphTypes).includes(nodeType)) {
      handlers.openContractForm()
    } else {
      console.warn('unhandled node type')
    }
  })

  // link removal
  paper.on('link:pointerdblclick', (view) => {
      view.model.remove()
  })

  // toggle panning
  paper.on('blank:pointerdblclick', () => {
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

function setLayout (graph) {

  joint.layout.DirectedGraph.layout(graph, {
    setLinkVertices: false,
    rankDir: 'TB', // left-right
    rankSep: 100,
    edgeSep: 25,
    marginX: 100,
    marginY: 100,
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

  const moarNodes = generateConstructorElements(exampleGraphs._constructor)

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

  // TODO: non-functional attempt at resetting position of child is moved out of parent
  //       based on old API,=
  // atom1.on('change:position', function(cell, position) {

  //   var parentId = cell.get('parent')
  //   if (!parentId) return

  //   var parent = jointGraph.getCell(parentId)
  //   var parentBbox = parent.getBBox()
  //   var cellBbox = cell.getBBox()

  //   if (parentBbox.containsPoint(cellBbox.origin()) &&
  //     parentBbox.containsPoint(cellBbox.topRight()) &&
  //     parentBbox.containsPoint(cellBbox.corner()) &&
  //     parentBbox.containsPoint(cellBbox.bottomLeft())) {

  //     // All the four corners of the child are inside
  //     // the parent area.
  //     return
  //   }
  //   debugger
  //   // Revert the child position.
  //   cell.set('position', cell.previous('position'))
  // })
}
