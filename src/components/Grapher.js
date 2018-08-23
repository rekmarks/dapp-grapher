
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom'
import uuid from 'uuid/v4'

import { contractGraphTypes } from '../graphing/graphGenerator'
import jh from '../graphing/jointHelper'
import { grapherModes } from '../redux/reducers/grapher'

export default class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = {
      jointGraph: new joint.dia.Graph(),
      jointPaper: null,
      svgPanZoom: null,
      creatingDapp: false,
      wipGraph: null,
    }
  }

  /**
   * Resizes Joint Paper to fit its container
   */
  resizeJointPaper = () => {

    let height, width
    const container = this.props.graphContainer

    if (container && container.current) {

      height = container.current.clientHeight
      width = container.current.clientWidth

    } else {
      // arbitrary non-zero values
      height = 1
      width = 1
    }
    this.state.jointPaper.setDimensions(width, height)
  }

  /**
   * Sets joint graph state per grapherMode
   */
  setJointGraph = () => {

    if (!this.state.jointGraph) return

    if (this.props.grapherMode === grapherModes.main) {

      if (this.state.creatingDapp) {
 this.setState({
        creatingDapp: false,
        wipGraph: null,
      })
}

      this.state.jointGraph.clear()

      if (this.props.selectedGraph) {
        jh.addJointElements(
          this.state.jointGraph, this.props.selectedGraph, { setsLayout: true }
        )
      }

      if (this.state.svgPanZoom) this.state.svgPanZoom.reset()

    } else if (this.props.grapherMode === grapherModes.createDapp) {

      if (!this.state.creatingDapp) {

        const wipGraph = { ...this.props.accountGraph }
        wipGraph.id = uuid()

        this.state.jointGraph.clear()
        jh.addJointElements(
          this.state.jointGraph,
          wipGraph,
          { setsLayout: true }
        )

        wipGraph.type = 'dapp'

        this.setState({
          creatingDapp: true,
          wipGraph: wipGraph,
        })
      }
    }
  }

  // initialize jointGraph on mount
  componentDidMount () {

    const paper = jh.paper.initialize(
      this.jointElement,
      this.state.jointGraph,
      { openForm: this.openForm }
    )

    this.setState({
      jointPaper: paper,
    })

    this.setJointGraph()

    window.addEventListener('resize', this.resizeJointPaper)
  }

  // handles Joint state changes after mounting
  componentDidUpdate (prevProps) {

    this.resizeJointPaper()

    // set state after first update after mount
    if (this.state.jointPaper && !this.state.svgPanZoom) {

      this.setState({
        svgPanZoom: svgPanZoom(this.jointElement.childNodes[2], {
          beforePan: (oldPan, newPan) => {
            if (this.state.jointPaper._dappGrapher.panning) return true
            return false
          },
          dblClickZoomEnabled: false,
          maxZoom: 15,
          minZoom: 0.1,
          zoomScaleSensitivity: 0.45,
          fit: false,
          center: true,
        }),
      })
    }

    // if selected graph has changed, run set workflow
    if (prevProps.selectedGraph !== this.props.selectedGraph) {
      this.setJointGraph()
    }

    // if graphInsertions changed, add insertion graph elements to jointGraph
    if (
      this.props.grapherMode === grapherModes.createDapp &&
      prevProps.graphInsertions !== this.props.graphInsertions
    ) {
      this.updateWipGraph()
    }
  }

  // removes event listener created on mount
  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeJointPaper)
  }

  render () {
    return (
      <div
        id="Grapher-jointContainer"
        ref={ ref => {
          this.jointContainer = ref
        }}
      >
        <div ref={ ref => {
          this.jointElement = ref
        }} />
      </div>
    )
  }

  updateWipGraph = () => {

    if (!this.state.wipGraph) return

    const wipGraph = { ...this.state.wipGraph }
    const newElements = { ...this.props.insertionGraph.elements }
    const newId = uuid()

    Object.values(newElements.nodes).forEach(node => {
      node.id = newId + ':' + node.abiName
      wipGraph.elements.nodes[node.id] = node
    })
    Object.values(newElements.edges).forEach(edge => {
      edge.id = newId + ':' + edge.id
      wipGraph.elements.edges[edge.id] = edge
    })

    this.setState({ wipGraph })

    jh.addJointElements(
      this.state.jointGraph,
      { type: contractGraphTypes._constructor, elements: newElements },
      { setsLayout: false }
    )

    console.log(wipGraph)
  }

  /**
   * Handlers
   */

  /**
  * Opens form per Joint state and grapherMode.
  * Pass to Joint paper at initialization.
  */
  openForm = () => {

    if (this.props.grapherMode === grapherModes.main) {
      this.props.openContractForm()
    } else if (this.props.grapherMode === grapherModes.createDapp) {
      // do nothing for now
    }
  }
}

Grapher.propTypes = {
  accountGraph: PropTypes.object,
  grapherMode: PropTypes.string,
  graphContainer: PropTypes.object,
  graphInsertions: PropTypes.number,
  insertionGraph: PropTypes.object,
  insertionGraphId: PropTypes.string,
  openContractForm: PropTypes.func,
  selectedGraph: PropTypes.object,
  selectedGraphId: PropTypes.string,
}
