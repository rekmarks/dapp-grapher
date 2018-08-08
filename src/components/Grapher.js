
import cytoscape from 'cytoscape'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { contractGraphTypes } from '../graphing/contractParser'

class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = { cy: {}}
  }

  // initialize graph on mount
  componentDidMount () {
    this.initGraph()
  }

  // TODO: actual performance benefits from this?
  componentWillUnmount () {
    if (this.state.cy) {
        this.state.cy.destroy()
    }
  }

  // re-initialize graph if passed new graph
  componentDidUpdate (prevProps) {

    if (this.props.graph.id !== prevProps.graph.id) {
      this.state.cy.destroy()
      this.initGraph()
    }
  }

  // initialize graph and prepare for rendering
  initGraph = () => {

    this.props.graph.config.container = this.cyRef

    const cy = cytoscape(this.props.graph.config)

    // move function nodes as grid layout doesn't handle nested compound nodes
    if (this.props.graph.type === contractGraphTypes.completeAbi) {

      cy.elements('node[type = "function"]').positions((node, i) => {
        return {
          x: node.position('x'),
          y: node.position('y') - 100,
        }
      })
    }

    // handle opening contract form
    let nodeSelector
    switch (this.props.graph.type) {

      case contractGraphTypes._constructor:
        nodeSelector = 'node[type = "contract"]'
        break

      case contractGraphTypes.functions:
        nodeSelector = 'node[type = "contract"], node[type = "function"]'
        break

      case contractGraphTypes.completeAbi:
        nodeSelector = null
        break

      default:
        console.warn(
          'graph type unhandled for contract form: ' + this.props.graph.type
        )
        nodeSelector = 'node' // some default
    }

    if (this.props.graph.type === contractGraphTypes.functions) {

      cy.on('taphold', nodeSelector, event => {
        this.props.openContractForm()
      })
      // debugger
      setFunctionsLayout(cy, this.props.graph.layoutData)

      // const layout = cy.layout({
      //   name: 'grid',
      //   sort: sortNodes,
      //   rows: 2,
      //   condensed: true,
      // })

      // layout.run()
    }

    // set initial zoom and pan
    cy.zoom(0.6)
    cy.center()

    this.setState({ cy: cy})
  }

  render () {
    return <div style={this.props.graph.style} ref={(cyRef) => {
      this.cyRef = cyRef
    }}/>
  }
}

Grapher.propTypes = {
  graph: PropTypes.object,
  openContractForm: PropTypes.func,
}

export default Grapher

function setFunctionsLayout (cy, layoutData) {

  const layoutConfig = {
    name: 'grid',
    fit: false,
    sort: sortNodes,
    rows: 1,
    // cols: 2,
    condensed: true,
  }

  const hasParams = layoutData.functionsWithInputs
  // const noParams = layoutData.functionsWithoutInputs
  // const numFunctions = hasParams.length + noParams.length

  let row = 0; let width = 0; let height = 0
  const rowHeight = 200

  hasParams.forEach(func => {

    const inputNodes = cy.elements('node[parent = "' + func + '"]')
    inputNodes.layout(layoutConfig).run()

    if (Math.ceil(inputNodes.length * 50) + 50 > 600) {
      row++
      width = 0
      height = height - (rowHeight * row)
    }

    inputNodes.positions((node, i) => {
      return {
        x: node.position('x') + width,
        y: node.position('y') - height,
      }
    })

    width += Math.ceil(inputNodes.length * 50) + 50
  })
}

function sortNodes (a, b) {

  const aType = a.data('type'); const bType = b.data('type')
  const aParent = a.data('parent'); const bParent = b.data('parent')
  const aName = a.data('nodeName'); const bName = b.data('nodeName')

  if (aType === 'contract') return 1
  if (bType === 'contract') return -1

  // if (aType === 'function' && bType === 'function') {
  //   if (a.data('hasChildren')) {
  //     if (b.data('hasChildren')) return 0
  //     else return 1
  //   } else {
  //     if (b.data('hasChildren')) return -1
  //     else return 0
  //   }
  // }
  // if (aType === 'function') return 1
  // else if (bType === 'function') return -1

  if (aType === bType) {
    if (aParent === bParent) {
      return aName < bName ? -1 : 1
    } else {
      return aParent < bParent ? -1 : 1
    }
  } else {
    if (aType === 'function') return 1
    if (bType === 'function') return -1
  }
  return 0
}
