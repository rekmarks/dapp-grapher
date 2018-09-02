
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom'
import uuid from 'uuid/v4'

import { grapherModes } from '../redux/reducers/grapher'

import { contractGraphTypes } from '../graphing/graphGenerator'
import jh from '../graphing/jointHelper'

/**
 * TODO
 * There's a significant amount of application logic in this component that
 * should be moved to redux thunks if possible
 */

export default class Grapher extends Component {

  constructor (props) {
    super(props)
    this.state = {
      jointGraph: new joint.dia.Graph(),
      jointPaper: null,
      svgPanZoom: null,
      creatingDapp: false,
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
        })
      }

      this.state.jointGraph.clear()

      if (this.props.selectedGraph) {

        const meta = { setsLayout: true }

        if (this.props.selectedGraph.type === contractGraphTypes.functions) {
          meta.layoutOptions = {}
          meta.layoutOptions.rankDir = 'TB'
        }

        jh.addJointElements(
          this.state.jointGraph,
          this.props.selectedGraph,
          meta
        )
      }

      if (this.state.svgPanZoom) this.state.svgPanZoom.reset()

    } else if (this.props.grapherMode === grapherModes.createDapp) {

      // if this condition is true,
      if (!this.state.creatingDapp) {

        const wipGraph = { ...this.props.accountGraph }
        wipGraph.contracts = {}
        delete wipGraph.id
        // absence of id used to indicate that user cannot save the wipGraph
        // see ResourceMenu prop, hasWipGraph

        this.state.jointGraph.clear()

        jh.addJointElements(
          this.state.jointGraph,
          wipGraph,
          { setsLayout: false }
        )

        wipGraph.type = 'dapp'

        this.props.storeWipGraph(wipGraph)
      }
    }
  }

  // initialize jointGraph on mount
  componentDidMount () {

    const paper = jh.paper.initialize(
      this.jointElement,
      this.state.jointGraph,
      {
        openForm: this.openForm,
        addEdge: this.addWipGraphEdge,
        removeEdge: this.removeWipGraphEdge,
      }
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

  /**
   * Inserts insertionGraph elements into wipGraph and saves wipGraph to store
   */
  updateWipGraph = () => {

    if (!this.props.wipGraph) return

    const wipGraph = { ...this.props.wipGraph }

    if (!wipGraph.id) wipGraph.id = uuid()

    const contractId = uuid()
    const insertionGraph = { ...this.props.insertionGraph }
    insertionGraph.id = contractId + ':graph'

    if (!wipGraph.contracts[insertionGraph.name]) {
      wipGraph.contracts[insertionGraph.name] = []
    }

    wipGraph.contracts[insertionGraph.name].push(contractId)

    Object.values(insertionGraph.elements.nodes).forEach(node => {

      if (Object.values(contractGraphTypes).includes(node.type)) {
        node.id = contractId
      } else if (node.abiName) {
        node.id = contractId + ':' + node.abiName
        node.parent = contractId
      } else if (node.type === 'output') {
        // constructor output nodes have no abi names
        node.id = contractId + ':instance'
        node.parent = contractId
      }
      wipGraph.elements.nodes[node.id] = node
    })

    Object.values(insertionGraph.elements.edges).forEach(edge => {
      edge.id = contractId + ':' + edge.id
      wipGraph.elements.edges[edge.id] = edge
    })

    jh.addJointElements(
      this.state.jointGraph,
      insertionGraph,
      { setsLayout: false }
    )

    this.props.storeWipGraph(wipGraph)
  }

  /**
   * Handlers
   */

  /**
  * Opens form per Joint state and grapherMode.
  * Pass to Joint paper at initialization.
  */
  openForm = functionId => {

    if (this.props.grapherMode === grapherModes.main) {

      if (functionId) this.props.selectContractFunction(functionId)

      this.props.openContractForm()

    } else if (this.props.grapherMode === grapherModes.createDapp) {
      // do nothing for now
    }
  }

  /**
   * Adds an edge to the current wipGraph and saves the wipGraph to store
   * @param  {object} edge the edge to be added]
   */
  addWipGraphEdge = edge => {

    const wipGraph = { ...this.props.wipGraph }

    for (const node of Object.values(wipGraph.elements.nodes)) {

      // TODO: does not handle duplicate display names among
      // children of the parent node (likely edge case)
      if (!edge.source || !edge.target) {

        if (
          node.parent === edge.sourceParent &&
          node.displayName === edge.sourceName
        ) {
          edge.source = node.id
          edge.sourceAbiType = node.abiType
        }

        if (
          node.parent === edge.targetParent &&
          node.displayName === edge.targetName
        ) {
          edge.target = node.id
          edge.targetAbiType = node.abiType
        }
      } else break
    }

    delete edge.sourceName
    delete edge.targetName

    wipGraph.elements.edges[edge.id] = edge

    this.props.storeWipGraph(wipGraph)
  }

  /**
   * Removes an edge from the wipGraph and saves the wipGraph to store
   * @param  {string} edgeId the id of the edge to be deleted
   */
  removeWipGraphEdge = edgeId => {

    const wipGraph = { ...this.props.wipGraph }

    delete wipGraph.elements.edges[edgeId]

    this.props.storeWipGraph(wipGraph)
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
  selectContractFunction: PropTypes.func,
  selectedGraph: PropTypes.object,
  selectedGraphId: PropTypes.string,
  storeWipGraph: PropTypes.func,
  wipGraph: PropTypes.object,
}
