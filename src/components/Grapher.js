
import joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

// import { contractGraphTypes } from '../graphing/parseContract'
import jh from '../graphing/jointHelper'

export default class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = {
      jointGraph: new joint.dia.Graph(),
      jointPaper: null,
      svgPanZoom: null,
    }
  }

  /**
   * Resizes Joint Paper to fit its container
   */
  resizeJointPaper = () => {
    // debugger
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
    // this.state.jointPaper.setDimensions(1400, 488)
  }

  setJointGraph = () => {

    if (!this.state.jointGraph) return

    this.state.jointGraph.clear()

    if (!this.props.graph) return

    jh.setJointElements(this.state.jointGraph, this.props.graph)
  }

  // initialize jointGraph on mount
  componentDidMount () {

    const paper = jh.paper.initialize(
      this.jointElement,
      this.state.jointGraph,
      { openContractForm: this.props.openContractForm}
    )

    this.setState({
      jointPaper: paper,
    })

    this.setJointGraph()

    window.addEventListener('resize', this.resizeJointPaper)
  }

  componentDidUpdate (prevProps) {

    this.resizeJointPaper()

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

    if (prevProps.graph !== this.props.graph) this.setJointGraph()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeJointPaper)
  }

  // re-initialize graph if passed new graph
  // componentDidUpdate (prevProps) {

  // }

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
}

Grapher.propTypes = {
  graph: PropTypes.object,
  graphContainer: PropTypes.object,
  openContractForm: PropTypes.func,
}
