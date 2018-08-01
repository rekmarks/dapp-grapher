
import util from 'util'
import assert from 'assert'
import { contracts } from 'chain-end'

import parseContract from '../graphing/contractParser'

const StandardERC20 = contracts.StandardERC20
const testGraph = parseContract(StandardERC20, 0)
console.log(util.inspect(testGraph.config.elements, {showHidden: false, depth: null}))

it('parsed contract not null', () => {
  assert(testGraph)
})
