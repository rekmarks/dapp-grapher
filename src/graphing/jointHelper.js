
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
  generate: generateModel,
  paper: {
    addEventHandlers: addPaperEventHandlers,
    initialize: initializePaper,
  }
}

export default jointHelper

/**
 * CUSTOM ELEMENT DEFINITIONS
 */

// TBD?

/**
 * GRAPH GETTERS
 */

function generateModel (jointGraph, dappGraph) {

  let cells
  switch (dappGraph.type) {

    case contractGraphTypes._constructor:
      cells = generateConstructorModel(dappGraph)
      break

    case contractGraphTypes.functions:
      cells = generateFunctionsModel(dappGraph)
      break

    default:
      throw new Error('unknown graph type')
  }
  jointGraph.addCells(cells)
  setLayout(jointGraph)
}

function generateConstructorModel (dappGraph) {

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

function generateFunctionsModel (dappGraph) {

  // const constructorElement = generateAtomic(
  //   'Constructor',
  //   { id: dappGraph.id },
  //   ioNodes.length > 0 ? ioNodes : null
  // )
  // contractElement.embed(constructorElement)
}

/*eslint-disable */
function generateDummyGraph (jointGraph) {

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

  const moarNodes = generateConstructorModel(exampleGraphs._constructor)

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
/*eslint-enable */

/**
 * ELEMENT GETTERS
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

      if (node.type !== 'parameter' && node.type !== 'ouput') { throw new Error('invalid port node; neither parameter nor output') }

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

// function generateAtomic (displayName, nodeProps = null, ioNodes = null) {

//   // TODO: 8-10: set displayName such that it's displayed
//   const atomic = new joint.shapes.devs.Atomic({
//     size: { width: 75, height: 150 },
//     _dappGrapher: nodeProps ? { ...nodeProps } : {},
//   })
//   atomic.attr({
//     text: { text: displayName, fill: 'black'},
//   })

//   if (ioNodes) {
//     // atomic.attributes.ports.groups.in.position.name = 'top'
//     // atomic.attributes.ports.groups.in.label.position.name = 'top'
//     // atomic.attributes.ports.groups.in.label.position.args.y = -10
//     const ports = generatePorts(ioNodes)
//     ports.forEach(port => {
//       if (port.type === 'in') atomic.addInPort(port.name, port.opts)
//       else atomic.addOutPort(port.name, port.opts)
//     })
//   }

//   return atomic
// }

// function generatePorts (ioNodes) {

//   const ports = []

//   if (ioNodes) {

//     ioNodes.forEach(node => {

//       if (node.type !== 'parameter' && node.type !== 'ouput') { throw new Error('invalid port node; neither parameter nor output') }

//       ports.push({
//         name: node.displayName,
//         opts: {
//           _dappGrapher: {
//             id: node.id,
//             abiName: node.abiName,
//             abiType: node.abiType,
//           },
//         },
//         type: node.type === 'output' ? 'out' : 'in',
//       })
//   })
// }

//   return ports
// }

function getDefaultLink () {
  const link = new joint.shapes.standard.Link()
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
  paper._dappGrapher ={
    panning: false,
  }

  paper.scale(0.9)

  addPaperEventHandlers(paper, eventHandlers)

  return paper
}

function addPaperEventHandlers (paper, handlers) {

  paper.on('cell:pointerdblclick', (cellview, evt, x, y) => {
    console.log(cellview, evt) // dev temp

    const nodeType = getCustomAttributeFromView(cellview, 'type')

    if (!nodeType) {
      console.warn('joint element missing type')
      return
    }

    switch (nodeType) {

      case contractGraphTypes._constructor:
        handlers.openContractForm()
        break

      default:
        console.log(nodeType)
        break
    }
  })
  paper.on('link:pointerdblclick', (linkView) => {
      linkView.model.remove()
  })
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
    rankDir: 'LR', // left-right
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
