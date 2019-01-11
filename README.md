# DappGrapher
A universal, client-side GUI for composing, deploying, and interacting with
dapps on Ethereum.

Use the default contracts or add your own. Any valid contract will work.
All you need is the JSON output from the Solidity compiler. We recommend using [Truffle](https://www.npmjs.com/package/truffle).

## Call for Contributors

DappGrapher is an open source project supported by [MetaMask](https://github.com/MetaMask).
We are welcoming contributors who want to help democratize smart contracts.
See [Contributions and Roadmap](#contributions-and-roadmap) for details.

## Installation & Usage
- Download the repo at `master`
- `npm install`
- Install and log in to MetaMask
  - DappGrapher has only been tested using Chrome and Brave
- Select an Ethereum network of your choice
  - For easier testing/development, do `npm run ganache` and select
  **Localhost 8545** from the MetaMask network dropdown
- `npm run start`
- For an example workflow, see [this video](https://www.youtube.com/watch?v=I9MR9Cba9is)

### Usage Notes
- Many bugs can be resolved by clearing your Chromium browser's local storage

### Disclaimer
DappGrapher is still a prototype. In using it, you will find bugs, missing
features, inefficiencies and bad UX. As a developer, you will find ugly hacks
in its code.

No security or performance guarantees are made about the default contracts
types, or any contract or dapp you deploy or interact with using DappGrapher.

**Tl;dr:** use at your own risk.

## Contributions and Roadmap

DappGrapher is one small part of the wider effort in the Ethereum community to
scale the platform and promote blockchain adoption worldwide. If you are
interested in the reasoning behind it, see [this Medium article](https://medium.com/pennblockchain/the-case-for-graphical-smart-contract-editors-8e721cdcde93).

**We are actively looking for contributors.** If you are interested in
contributing, please read on to understand the immediate goals of the project,
and pick something below. If you have any questions or wish to contribute something not listed, please open an [Issue](https://github.com/rekmarks/dapp-grapher/issues).

### Immediate Goals

Before more features are added, DappGrapher's foundations need work. 

1. Refactor graph backend to use [`graphlib`](https://www.npmjs.com/package/graphlib) instead of the hacky bespoke schema currently in use
	- **Note:** This is a **blocker** since the graph schema is fundamental to much of DappGrapher's functionality
	- See the [graphlib-refactor](https://github.com/rekmarks/dapp-grapher/tree/graphlib-refactor) branch
- Refactor Redux middleware from `redux-thunk` to [`redux-saga`](https://www.npmjs.com/package/redux-saga)
	- `redux-saga` was designed precisely to deal with the kind of failure-prone, asynchronous work that DappGrapher is rife with
	- **Note:** This is also a **blocker** since anything `web3`-related is asynchronous and currently bound up in thunks
- Refactor existing, hacky state-persistence functionality to use [`redux-persist`](https://www.npmjs.com/package/redux-persist), and enable state importing in the process
- Fix testing and error handling
	- Determine testing framework
	- Write Tests
		- Reducer unit tests
		- State persistence tests
		- Component tests
	- Add [`redux-devtools`](https://github.com/reduxjs/redux-devtools) support.
- "Robustifying," a.k.a. undoing/making up for shortcuts taken during early development
	- [`@material-ui`](https://www.npmjs.com/package/@material-ui/core) usage
		- Consistent style management should be enforced, and dead/useless class passing should be minimized
	- Move application logic contained in components into reducers
	- Normalize entire Redux store per [`normalizr`](https://github.com/paularmstrong/normalizr )
	- To find more: `grep -RF 'TODO' dapp-grapher/src`

### Longer-Term Goals

Reasons to download this repo.

- Add [`drizzle`](https://github.com/trufflesuite/drizzle) support
	- `drizzle` has a ton of awesome features for interacting with `web3` entities
	- This will give the user a live view of the states of their dapps
- Add post-deployment setup workflows to dapp templates
	- For instance, an allowance must be set to enable a crowdsale to spend tokens on the user's behalf after deployment, but this can only be done manually at the moment.
- Allow the usage of already published contracts in dapp templates
- Create bespoke UIs for common contracts, such as ERC20 tokens

## License

MIT
