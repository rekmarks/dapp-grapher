
const assert = require('assert')
const util = require('util')

const Deployer = require('smart-contract-deployment-manager')
const parse = require('../src/parser')

const StandardERC20_JSON = require('./helpers/StandardERC20.json')

const elements = parse(StandardERC20_JSON)

console.log(util.inspect(elements, {showHidden: false, depth: null}))
