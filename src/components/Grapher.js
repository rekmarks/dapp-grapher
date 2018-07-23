
import cytoscape from 'cytoscape'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

/**
 * TODO
 * - This re-renders on every route, make it stop, probably
 */

class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = { cy: {} }
  }

  componentDidMount () {

    this.props.graph.config.container = this.cyRef

    const cy = cytoscape(this.props.graph.config)
    cy.zoom(0.9)
    cy.center()
    cy.on('tap', 'node', function (evt) {
      const node = evt.target
      console.log('tapped ' + node.id())
    })
    this.setState({ cy: cy })
  }

  componentWillUnmount () {
    if (this.state.cy) {
        this.state.cy.destroy()
    }
  }

  // Cytoscape has its own renderer, this decreases React re-renders
  shouldComponentUpdate () {
    return false
  }

  render () {

    return <div style={this.props.graph.style} ref={(cyRef) => {
      this.cyRef = cyRef
    }}/>
  }
}

Grapher.propTypes = {
  graph: PropTypes.object,
}

export default Grapher
