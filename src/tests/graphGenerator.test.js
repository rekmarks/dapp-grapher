
/*eslint-disable */
const util = require('util')

import { Deployer, deploy, contracts } from 'chain-end'
import parse from '../graphing/graphGenerator'

const StandardERC20_Artifact = contracts.StandardERC20

const StandardERC20_Graph = parse(StandardERC20_Artifact, 2)

console.log(util.inspect(StandardERC20_Graph, {showHidden: false, depth: null}))

// TODO: write this after migrating to graphlib

it('StandardERC20_Graph returned correctly', () => {
  expect(StandardERC20_Graph)
})

