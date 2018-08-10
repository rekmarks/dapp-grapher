
import joint from 'jointjs'

// http://resources.jointjs.com/docs/jointjs/v2.1/joint.html#shapes.devs

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

const linkDefaultConfig = {
  wrapper: {
    strokeWidth: 25,
  },
}

const config = {
  paper: paperConfig,
  linkDefault: linkDefaultConfig,
}

/**
 * EXPORT
 */

const generate = {
  constructorCells,
  functionsCells,
  dummyGraph,
}

const manipulate = {
  connect,
  addPaperEventHandlers,
  setLayout,
}

const jointHelper = {
  generate,
  manipulate,
  config,
  initializePaper,
}

export default jointHelper

/**
 * JOINT ELEMENT GETTERS
 */

function constructorCells (graph) {

}

function functionsCells (graph) {
  return new joint.shapes.dappGrapher.CustomRectangle({
    position: { x: 150, y: 60 },
    size: { width: 100, height: 30 },
  })
}

function dummyGraph (graph) {

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

    // coupled cells must be added before embedded cells or the latter end up on the bottom
    graph.addCells([coupled1, rect, rect2, rect3, atom1, atom2]) // replace with generateJointJSX

    coupled1.embed(atom1)
    coupled1.embed(atom2)
    // coupled1.fitEmbeds({padding: 50})

    connect(graph, rect, 'out', rect2, 'in')
    connect(graph, rect3, 'out', atom1, 'in')
    connect(graph, rect2, 'out', rect3, 'in')
    connect(graph, rect, 'out', atom2, 'in')

    setLayout(graph)
}

/**
 * CUSTOM ELEMENTS
 */

// joint.shapes.standard.Rectangle.define('dappGrapher.CustomRectangle', {
//     attrs: {
//         body: {
//             rx: 10, // add a corner radius
//             ry: 10,
//             strokeWidth: 1,
//             fill: 'cornflowerblue',
//         },
//         label: {
//             textAnchor: 'left', // align text to left
//             refX: 10, // offset text from right edge of model bbox
//             fill: 'white',
//             fontSize: 18,
//         },
//     },
// })

joint.shapes.standard.Rectangle.define('dappGrapher.CustomRectangle', {
    attrs: {
        body: {
            rx: 10, // add a corner radius
            ry: 10,
            strokeWidth: 1,
            fill: 'cornflowerblue',
        },
        label: {
            textAnchor: 'left', // align text to left
            refX: 10, // offset text from right edge of model bbox
            fill: 'white',
            fontSize: 18,
        },
    },
}, {
    // inherit joint.shapes.standard.Rectangle.markup
}, {
    createRandom: function () {

        var rectangle = new this()

        var fill = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
        var stroke = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
        var strokeWidth = Math.floor(Math.random() * 6)
        var strokeDasharray = Math.floor(Math.random() * 6) + ' ' + Math.floor(Math.random() * 6)
        var radius = Math.floor(Math.random() * 21)

        rectangle.attr({
            body: {
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                strokeDasharray: strokeDasharray,
                rx: radius,
                ry: radius,
            },
            label: { // ensure visibility on dark backgrounds
                fill: 'black',
                stroke: 'white',
                strokeWidth: 1,
                fontWeight: 'bold',
            },
        })

        return rectangle
    },
})

function getDefaultLink () {
  const link = new joint.shapes.standard.Link()
  link.attr(linkDefaultConfig)
  return link
}

/**
 * PAPER AND GRAPH MANIPULATORS
 */

function initializePaper (container, graph) {

  const paper = new joint.dia.Paper({
    ...paperConfig,
    el: container,
    model: graph,
  })

  paper.scale(0.9)

  addPaperEventHandlers(paper)

  return paper
}

function addPaperEventHandlers (paper) {

  paper.on('link:pointerdblclick', (linkView) => {
      linkView.model.remove()
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

  link.attr(linkDefaultConfig)

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
