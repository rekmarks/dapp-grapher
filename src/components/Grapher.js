import React, { Component } from 'react'
import cytoscape from 'cytoscape'

import compound from '../temp/compound'

class Grapher extends Component {

  constructor(props) {
    super(props)
    this.state = { cy: {} }
  }

  componentDidMount() {

    compound.config.container = this.cyRef
    const cy = cytoscape(compound.config)

    cy.on('tap', (event) => {
      console.log(cy.pan())
      console.log(cy.zoom())
    })

    // does not work, zoom and pan are reset afterwards
    // cy.zoom(1.5)
    // cy.pan(100, -200)

    this.setState({ cy: cy })
  }

  componentWillUnmount() {
    if (this.state.cy) {
        this.state.cy.destroy()
    }
  }

  // shouldComponentUpdate() {
  //   return false
  // }

  render() {

    // if (Object.keys(this.state.cy).length > 0) {
    //   console.log(this.state.cy)
    // }

    return <div style={compound.style} ref={(cyRef) => this.cyRef = cyRef}/>       
  }
}

export default Grapher
