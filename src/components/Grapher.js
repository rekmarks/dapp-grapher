
import cytoscape from 'cytoscape'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { contractGraphTypes } from '../graphing/contractParser'

class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = { cy: {}}
    this.initGraph = this.initGraph.bind(this)
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
  initGraph () {

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

    // set initial zoom and pan
    cy.zoom(0.6)
    cy.center()

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

    if (this.props.graph.type !== contractGraphTypes.completeAbi) {

      cy.on('taphold', nodeSelector, event => {
        this.props.openContractForm()
      })
    }

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
