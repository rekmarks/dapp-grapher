
import parse from '../../graphing/contractParser'
import graphTemplate from '../../graphing/graphTemplate'
import { contracts } from 'chain-end' // this might be a little beefy one day

// dev-temp - this will all happen as a result of user action
const testGraph = parse(contracts.StandardERC20, 1)
// dev-temp

const ACTIONS = {
  PARSE_CONTRACT: 'PARSER:PARSE_CONTRACT',
}

const initialState = {
  contracts: contracts,
  selectedGraph: testGraph, // null
  contractGraphs: [testGraph], // []
}

export {
  getParseContractAction,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.PARSE_CONTRACT:

      // TODO: disallow re-parsing contracts
        // i.e. create a normalized schema for storing parsed contracts

      // TODO: allow user to select parsing mode
      const contractGraph = {...graphTemplate}
      contractGraph.config.elements = parse(action.contract, 1)
      contractGraph.name = action.contract.contractName

      return {
        ...state,
        selectedGraph: contractGraph,
        contractGraphs: state.contractGraphs.concat([contractGraph]),
      }

    default:
      return state
  }
}

/* Synchronous action creators */

function getParseContractAction (contract) {
  return {
    type: ACTIONS.PARSE_CONTRACT,
    contract: contract,
  }
}
