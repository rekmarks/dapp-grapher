
/**
 * example nodes and edges
 *
  elements: {
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

const config = {

  // container: null, // will be set to this.cyRef

  // initial viewport state:
  // zoom: 1.5,
  // pan: { x: 100, y: -75 },

  // interaction options:
  autounselectify: false,
  boxSelectionEnabled: false,
  // minZoom: 1e-50,
  // maxZoom: 1e50,
  // zoomingEnabled: true,
  // userZoomingEnabled: true,
  // panningEnabled: true,
  // userPanningEnabled: true,
  // selectionType: 'single',
  // touchTapThreshold: 8,
  // desktopTapThreshold: 4,
  // autolock: false,
  // autoungrabify: false,

  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(nodeName)', // usually data(id), but we want the name
        'text-valign': 'center',
        'text-halign': 'center',
      },
    },
    {
      selector: '$node > node',
      css: {
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
        'text-valign': 'top',
        'text-halign': 'center',
        'background-color': '#bbb',
      },
    },
    {
      selector: 'edge',
      css: {
        'target-arrow-shape': 'triangle',
      },
    },
    {
      selector: ':selected',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black',
      },
    },
  ],

  elements: {},

  layout: {
    name: 'grid',
    // padding: 5
  },
}

const style = {
  height: '100%',
  width: '100%',
  position: 'absolute',
  left: '0px',
  top: '110px', // TODO: set dynamically to equal header height
  // 'zIndex': '-10',
}

const template = {
  config: config,
  style: style,
}

export default template
