
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom'
import uuid from 'uuid/v4'

import { grapherModes } from '../redux/reducers/grapher'

import { graphTypes } from '../graphing/graphGenerator'

import {
  initializeJointPaper,
  setJointElements,
} from '../graphing/jointHelper'

/**
 * TODO
 * There's a significant amount of application logic in this component that
 * should be moved to redux thunks if possible
 */

/**
 * Functional component containing the JointJS 'canvas' where graphs are
 * displayed and interacted with. Occupies the most visual real estate of any
 * component.
 *
 * @extends {Component}
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
      // arbitrary non-zero values to prevent CSS/rendering weirdness
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

      if (this.props.displayGraph) {

        const meta = { setsLayout: true }

        if (this.props.displayGraph.type === graphTypes.contract.functions) {
          meta.layoutOptions = {}
          meta.layoutOptions.rankDir = 'TB'
        }

        setJointElements(
          this.state.jointGraph,
          this.props.displayGraph,
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
        // TODO: make this dependent on grapherMode instead

        this.state.jointGraph.clear()

        setJointElements(
          this.state.jointGraph,
          wipGraph,
          { setsLayout: false }
        )

        wipGraph.type = graphTypes.dapp.template

        this.props.storeWipGraph(wipGraph)
      }
    }
  }

  // initialize jointGraph on mount
  componentDidMount () {

    const paper = initializeJointPaper(
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
            if (this.state.jointPaper.dappGrapher.panning) return true
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
    if (prevProps.displayGraph !== this.props.displayGraph) {
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

    // TODO: move application logic to thunk?

    if (!this.props.wipGraph) return

    const wipGraph = { ...this.props.wipGraph }

    // set wipGraph id if missing
    if (!wipGraph.id) wipGraph.id = uuid()

    // each contract added to wipGraph must be uniquely identified
    const contractId = uuid()
    const insertionGraph = { ...this.props.insertionGraph }
    insertionGraph.id = contractId + ':graph'

    // contracts of wipGraph are stored in array by contract type/name
    wipGraph.contracts[insertionGraph.name]
    ? wipGraph.contracts[insertionGraph.name].push(contractId)
    : wipGraph.contracts[insertionGraph.name] = [contractId]

    // add nodes of insertionGraph to wipGraph
    Object.values(insertionGraph.elements.nodes).forEach(node => {

      if (Object.values(graphTypes.contract).includes(node.type)) {
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

    // add edges of insertionGraph to wipGraph
    Object.values(insertionGraph.elements.edges).forEach(edge => {
      edge.id = contractId + ':' + edge.id
      wipGraph.elements.edges[edge.id] = edge
    })

    // add insertionGraph elements to joint
    setJointElements(
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
  * Opens modal with ContractForm per Joint state and grapherMode.
  * Pass to Joint paper at initialization.
  */
  openForm = (functionId, contractName = null, instanceAddress = null) => {

    if (this.props.grapherMode === grapherModes.main) {

      if (
        this.props.displayGraph.type === graphTypes.dapp.deployed &&
        instanceAddress
      ) {

        // TODO
        // Run the get graph workflow for the graph associated with
        // instanceAddress, then call some other thunk (selectFormGraph probably)
        // that will ensure the modal opens with the correct content
        this.props.selectFormGraph(contractName, instanceAddress)

      } else if (
        this.props.displayGraph.type === graphTypes.dapp.deployed ||
        instanceAddress
      ) {
        throw new Error(
          'unhandled workflow: graph type ' + this.props.displayGraph.type +
          ' and instanceAddress ' + Boolean(instanceAddress)
        )
      }

      if (
        functionId &&
        this.props.displayGraph.type !== graphTypes.dapp.deployed
      ) {
        this.props.selectContractFunction(functionId)
      }

      this.props.openContractForm()

    } else if (this.props.grapherMode === grapherModes.createDapp) {
      // do nothing for now
      // TODO: do something here? Currently when creating a dapp,
      // all you do is wire the individual nodes together and we don't
      // want a form to open.
    }
  }

  /**
   * Adds an edge to the current wipGraph and saves the wipGraph to store
   * @param  {object}  edge  the edge to be added
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

    // TODO: why are these deleted?
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
  displayGraph: PropTypes.object,
  displayGraphId: PropTypes.string,
  storeWipGraph: PropTypes.func,
  wipGraph: PropTypes.object,
  selectFormGraph: PropTypes.func,
}
