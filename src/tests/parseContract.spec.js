
import util from 'util'
import assert from 'assert'
import { contracts } from 'chain-end'

import parseContract from '../graphing/parseContract'

const StandardERC20 = contracts.StandardERC20
const testGraph = parseContract(StandardERC20, 1)
console.log(util.inspect(testGraph, {showHidden: false, depth: null}))

it('parsed contract not null', () => {
  assert(testGraph)
})
