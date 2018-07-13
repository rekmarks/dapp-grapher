
const config = {

  container: null, // will be set to this.cyRef

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
        'content': 'data(id)',
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
    name: 'preset',
    padding: 5,
  },
}

const style = {
  height: '100%',
  width: '100%',
  position: 'absolute',
  left: '0px',
  top: '110px', // TODO: set dynamically to equal header height
  // 'zIndex': '-10', // otherwise the damn thing appears on top
}

const template = {
  config: config,
  style: style,
}

module.exports = template
