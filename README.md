# This Repository is Archived

![image](https://i.postimg.cc/524SRXbs/Dapp-Grapher-0-0-1.png)

# DappGrapher
A universal, client-side GUI for composing, deploying, and interacting with
systems of smart contracts on Ethereum. Currently in the prototype stage.

Use the default contracts or add your own. Any valid contract will work.
All you need is the JSON output from the Solidity compiler. We recommend using [Truffle](https://www.npmjs.com/package/truffle).

# Usage
[Click here](https://rekmarks.github.io/dapp-grapher/) to try out DappGrapher **now**. It requires [MetaMask](https://metamask.io).

To start working with the canvas, select an option from the main menu on the left of the screen. To deploy a dapp, first create a dapp template, which defines the contracts your dapp will contain and how they relate to each other. You add contracts to your template by selecting them from the menu, which will add a node representing their constructor to the canvas. You can connect the outputs of constructors, i.e. the address of the contract once deployed, to address inputs of other constructors.

When you have saved your template, select it to deploy a new instance. Double-click the contract constructors to enter your desired parameters. When you select deploy, the contracts will be published to your current Ethereum network in the order defined by the template.

Double-click an empty part of the canvas to enable panning with the mouse. Double-click again to resume interacting with contracts. Zooming is enabled by default.

For an example workflow, see [this video](https://www.youtube.com/watch?v=I9MR9Cba9is).

## Disclaimer
DappGrapher is still a prototype, and it is not ready for production usage. The default contracts should work out of the box, but DappGrapher has not been thoroughly tested or audited, and you deploy things to Mainnet at your own risk.

# Installation
- Download the repo at `master`
- `npm install`
- Install and log in to MetaMask
  - DappGrapher has only been tested with MetaMask on Chrome and Brave
- Select an Ethereum network of your choice
  - For easier testing/development, do `npm run ganache` and select
  **Localhost 8545** from the MetaMask network dropdown
- `npm run start`

## Technical Notes
DappGrapher is a client-side React app with a Redux backend and thunk middleware. Its primary feature is a graphical interface for composing and interacting with dapps. It uses [`@material-ui`](https://www.npmjs.com/package/@material-ui/core) for its user interface.

# Contributions and Roadmap

DappGrapher is one small part of the wider effort in the Ethereum community to
scale the platform and promote blockchain adoption worldwide. If you are
interested in the reasoning behind it, see [this Medium article](https://medium.com/pennblockchain/the-case-for-graphical-smart-contract-editors-8e721cdcde93).

## Call for Contributors

DappGrapher is an open source project supported by [MetaMask](https://github.com/MetaMask).
We are welcoming contributors who want to help democratize smart contracts.

If you are interested in contributing, please read on to understand the [Immediate Goals](#immediate-goals) of the project,
and pick something below. If you have any questions or wish to contribute something not listed, please open an [Issue](https://github.com/rekmarks/dapp-grapher/issues).

## Immediate Goals

Before more features are added, DappGrapher's foundations need work.

1. Refactor graph backend to use [`graphlib`](https://www.npmjs.com/package/graphlib) instead of the hacky bespoke schema currently in use
	- **Note:** This is a **blocker** since the graph schema is fundamental to much of DappGrapher's functionality
	- See the [graphlib-refactor](https://github.com/rekmarks/dapp-grapher/tree/graphlib-refactor) branch
2. Refactor Redux middleware from `redux-thunk` to [`redux-saga`](https://www.npmjs.com/package/redux-saga)
	- `redux-saga` was designed precisely to deal with the kind of failure-prone, asynchronous work that is DappGrapher's bread and butter
	- **Note:** This is also a **blocker** since almost everything `web3`-related is asynchronous and currently bound up in thunks
3. Refactor existing, hacky state-persistence functionality to use [`redux-persist`](https://www.npmjs.com/package/redux-persist), and enable state importing in the process
4. Fix testing and error handling
	- Determine testing framework
	- Write Tests
		- Reducer unit tests
		- State persistence tests
		- Component tests
	- Add [`redux-devtools`](https://github.com/reduxjs/redux-devtools) support.
5. "Robustifying," a.k.a. undoing shortcuts taken during early development and quality-of-life improvements
	- Improve `web3`-related functionality
		- For instance, the app's behavior when a user switches their Ethereum account after connecting to MetaMask isn't well defined
		- Add support for non-MetaMask dapp browsers
	- [`@material-ui`](https://www.npmjs.com/package/@material-ui/core) usage
		- Consistent style management should be enforced, and dead/useless class passing should be minimized
	- Move application logic contained in components into reducers
	- Normalize entire Redux store per [`normalizr`](https://github.com/paularmstrong/normalizr )
	- To find more: `grep -RF 'TODO' dapp-grapher/src`

## Longer-Term Goals

Reasons to get excited.

- Allow the usage of already published contracts in dapp templates
	- Currently, all contracts in a dapp template are deployed at the same time
- Add post-deployment setup workflows to dapp templates
	- Allow the user to designate function calls to be performed after all contracts have been deployed
	- For instance, an allowance must be set to enable a crowdsale to spend tokens on the user's behalf after deployment, but this can only be done manually at the moment
- Create bespoke UIs for common contracts, such as ERC20 tokens
- Add [Etherscan](https://etherscan.io/) integration
	- For instance, enable minimal-click Etherscan ABI validation
- Add [`drizzle`](https://github.com/trufflesuite/drizzle) integration
	- `drizzle` has a ton of awesome features for interacting with `web3` entities
	- This will give the user a live view of the states of their dapps

# License

MIT
