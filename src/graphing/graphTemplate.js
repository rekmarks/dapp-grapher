
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
  // zoom: 1.0,
  // pan:{ x: 100, y: -75 },

  // interaction options:
  autounselectify: false,
  boxSelectionEnabled: false,
  minZoom: 0.1,
  maxZoom: 1.25,
  zoomingEnabled: true,
  userZoomingEnabled: true,
  wheelSensitivity: 0.1,
  panningEnabled: true,
  userPanningEnabled: true,
  selectionType: 'single',
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,

  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(nodeName)', // usually data(id), but we want the name
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#242423',
        'color': '#F8F8F8',
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
        'background-color': '#434039',
        'color': '#222',
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
  },
}

const style = {
  height: '100%',
  width: '100%',
  position: 'fixed',
  paddingLeft: '180px', // TODO: set dynamically to equal resource menu width
  paddingTop: '0px',
  backgroundColor: '#F8F8F8',
  // 'zIndex': '-10', // doesn't seem to do anything
}

const template = {
  config: config,
  style: style,
}

export default template
