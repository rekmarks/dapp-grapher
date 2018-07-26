
/*eslint-disable */
const assert = require('assert')
const util = require('util')

import { Deployer, deploy, contracts } from 'chain-end'
import parse from '../graphing/contractParser'

const StandardERC20_JSON = contracts.StandardERC20

const elements = parse(StandardERC20_JSON, 0)

console.log(util.inspect(elements, {showHidden: false, depth: null}))

it('elements returned correctly', () => {
  assert(elements)
})
