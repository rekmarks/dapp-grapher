
/*eslint-disable */
const assert = require('assert')
const util = require('util')

import { Deployer, deploy, contracts } from 'chain-end'
import parse from '../graphing/graphGenerator'

const StandardERC20_JSON = contracts.StandardERC20

const elements = parse(StandardERC20_JSON, 2)

console.log(util.inspect(elements, {showHidden: false, depth: null}))

it('elements returned correctly', () => {
  assert(elements)
})
