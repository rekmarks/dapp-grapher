
import joint from 'jointjs'
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
    }
  }

  // initialize jointGraph on mount
  componentDidMount () {

    this.setState({
      jointPaper: jh.initializePaper(
        this.jointContainer,
        this.state.jointGraph
      ),
    })

    jh.generate.dummyGraph(this.state.jointGraph)

    window.addEventListener('resize', this.resizeJointPaper)
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

  componentDidUpdate () {
    this.resizeJointPaper()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeJointPaper)
  }

  // re-initialize graph if passed new graph
  // componentDidUpdate (prevProps) {

  // }

  render () {
    return (
      <div id="Grapher-jointContainer">
        <div ref={ ref => {
          this.jointContainer = ref
        }} />
      </div>
    )
  }
}

Grapher.propTypes = {
  graph: PropTypes.bool,
  graphContainer: PropTypes.object,
  openContractForm: PropTypes.func,
}
