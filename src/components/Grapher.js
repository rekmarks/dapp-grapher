
// import coseBilkent from 'cytoscape-cose-bilkent'
import cytoscape from 'cytoscape'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = { cy: {}}
    this.initGraph = this.initGraph.bind(this)
  }

  componentDidMount () {
    this.initGraph()
  }

  componentWillUnmount () {
    if (this.state.cy) {
        this.state.cy.destroy()
    }
  }

  componentDidUpdate (prevProps) {

    if (this.props.graph.id !== prevProps.graph.id) {
      this.state.cy.destroy()
      this.initGraph()
    }
  }

  initGraph () {

    this.props.graph.config.container = this.cyRef

    const cy = cytoscape(this.props.graph.config)

    // move function nodes as grid layout doesn't handle nested compound nodes
    if (this.props.graph.type === 'contract:completeAbi') {

      cy.elements('node[type = "function"]').positions( (node, i) => {
        return {
          x: node.position('x'),
          y: node.position('y') - 100,
        }
      })
    }

    // set initial zoom and pan
    cy.zoom(0.9)
    cy.center()

    // handle opening contract form
    cy.on('taphold', 'node', (event) => {

      const node = event.target

      if (node.data().type === 'contract') {
        this.props.openContractForm()
      }
    })
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
