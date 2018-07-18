
import parseContract from '../../graphing/contractParser'
import graphTemplate from '../../graphing/graphTemplate'
import { contracts } from 'chain-end'

const StandardERC20JSON = contracts.StandardERC20

const testGraph = Object.assign({}, graphTemplate)
testGraph.config.elements = parseContract(StandardERC20JSON, 1)

const ACTIONS = {
  PARSE_CONTRACT: 'PARSER:PARSE_CONTRACT',
}

const initialState = {

}

export {
  getParseContractAction,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.PARSE_CONTRACT:
      return {
        ...state,
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
