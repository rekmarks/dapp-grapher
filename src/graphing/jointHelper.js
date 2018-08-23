
import joint from 'jointjs'

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

  let cells
  switch (dappGraph.type) {

    case contractGraphTypes._constructor:
      cells = generateConstructorElements(dappGraph)
      break

    case contractGraphTypes.functions:
      cells = generateFunctionsElements(dappGraph)
      break

    case 'account':
      cells = generateAccountElements(dappGraph)
      break

    default:
      throw new Error('unknown graph type')
  }

  jointGraph.addCells(cells)
  if (meta.setsLayout) setLayout(jointGraph)
}


function generateAccountElements (dappGraph) {

  const displayName = dappGraph.elements.nodes.account.displayName

  const accountElement = generateAtomic(
    displayName,
    {
      size: { width: 50, height: 50 },
      _dappGrapher: {
        id: dappGraph.elements.nodes.account.id,
        type: dappGraph.elements.nodes.account.type,
      },
    },
    {
      '.body': { 'rx': 90, 'ry': 90},
      '.label': { 'text-anchor': 'middle', 'ref-x': 22.5, 'ref-y': -20 },
    },
    [dappGraph.elements.nodes['account:address']]
  )
  return [accountElement]
}

/**
 * [generateConstructorElements description]
 * @param  {[type]} dappGraph [description]
 * @return {[type]}           [description]
 */
function generateConstructorElements (dappGraph) {

  const ioNodes = Object.keys(dappGraph.elements.nodes).map(key => {
    return dappGraph.elements.nodes[key]
  }).filter(obj => obj.type === 'parameter' || obj.type === 'output')

  const contractElement = generateAtomic(
    dappGraph.name,
    {
      size: { width: 175, height: 100 },
      _dappGrapher: {
        contractName: dappGraph.name,
        id: dappGraph.id,
        type: dappGraph.type,
      },
    },
    {
      '.label': { 'text-anchor': 'middle', 'ref-y': 40 },
      '.body': { 'rx': 10, 'ry': 10 },
    },
    ioNodes
  )

  return [contractElement]
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
        size: { width: 75, height: 150 },
        _dappGrapher: {
          id: node.id,
          abiName: node.abiName,
          abiType: node.abiType,
        },
      },
      null,
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

// function generateCircle (circleNode, size, labelAttr, ioNodes = null) {

//   let outGroup
//   if (ioNodes) {
//     outGroup = {
//       position: { name: 'right' },
//       label: {
//         position: {
//           args: { y: 10 },
//           name: 'right',
//         },
//       },
//       attrs: {
//         '.port-body': {
//           fill: "#fff",
//           stroke: "#000",
//           r: 10,
//           magnet: true,
//         },
//         '.port-label': { fill: "#000" },
//       },
//     }
//   } else outGroup = {}


//   const circle = new joint.shapes.standard.Circle({
//     _dappGrapher: { ...circleNode },
//     ports: { groups: { out: outGroup }, items: [] },
//   })
//   circle.resize(size, size)
//   circle.attr({
//     label: {
//       text: circleNode.displayName,
//       fill: 'black',
//       ...labelAttr,
//     },
//     // TODO: wrap label for layout purposes
//     // the below doesn't work
//     // outline: {
//     //   ref: 'label',
//     //   refX: 0,
//     //   refY: 0,
//     //   refWidth: '100%',
//     //   refHeight: '100%',
//     //   strokeWidth: 1,
//     //   stroke: '#000000',
//     //   fill: 'none',
//     // },
//   })

//   if (ioNodes) {

//     const ports = generatePorts(ioNodes)
//     ports.forEach(port => {
//       circle.addPort(port)
//     })
//   }

//   return circle
// }

// function generateIOCircles (ioNodes) {

//   const circles = []

//   if (ioNodes) {

//     const labelAttr = {
//       textAnchor: 'left',
//       refX: '125%',
//       refY: '55%',
//     }

//     ioNodes.forEach(node => {

//       if (node.type !== 'parameter' && node.type !== 'output') {
//         throw new Error('invalid port node; neither parameter nor output')
//       }

//       circles.push(generateCircle(node, 25, labelAttr))
//     })
//   }
//   return circles
// }

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

function initializePaper (jointElement, graph, eventHandlers) {

  const paper = new joint.dia.Paper({
    ...paperConfig,
    el: jointElement,
    model: graph,
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

    const nodeType = getCustomAttributeFromView(view, 'type')

    if (!nodeType) {
      console.warn('joint element missing type')
      return
    }

    if (Object.values(contractGraphTypes).includes(nodeType)) {

      handlers.openForm()

    } else if (nodeType === 'ui') {
      // do nothing
    } else {
      console.warn('unhandled node type')
    }
  })

  // link removal
  paper.on('link:pointerdblclick', (view) => {
      view.model.remove()
  })

  // toggle panning
  paper.on('blank:pointerdblclick', (view, evt) => {
    paper._dappGrapher.panning = !paper._dappGrapher.panning
    temp(paper)
  })
}

function temp (paper) {

  const cells = paper.options.model.getCells()
  const elements = { nodes: [], edges: [] }

  let linkCount = 0

  cells.forEach(cell => {

    const data = cell.attributes._dappGrapher

    if (cell.isLink()) {

      const source = cell.getSourceElement()
      const target = cell.getTargetElement()

      console.log(source, target)

      elements.edges.push({
        id: linkCount,
        source: {
          node: source.attributes._dappGrapher.id,
          port: cell.attributes.source.port,
        },
        target: {
          node: target.attributes._dappGrapher.id,
          port: cell.attributes.target.port,
        },
      })

      linkCount++

    } else {
      elements.nodes.push({ ...data })
    }
  })
  console.log(elements)
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
    rankDir: 'TB', // top to bottom
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
