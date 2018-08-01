
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
      // this.state.cy.destroy()
      // this.setState({cy: null})
      // this.initGraph()
      this.state.cy.json({ elements: this.props.graph.config.elements })
      // debugger
      this.state.cy.layout({
        name: 'grid',
      }).run()
      this.state.cy.zoom(0.9)
      this.state.cy.center()
    }
  }

  initGraph () {

    this.props.graph.config.container = this.cyRef

    // cytoscape.use(coseBilkent)

    const cy = cytoscape(this.props.graph.config)
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

  // Cytoscape has its own renderer, this decreases React re-renders
  // shouldComponentUpdate () {
  //   return false
  // }

  render () {
    // console.log(this.props.graph)
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
