# DappGrapher
A universal, client-side GUI for composing, deploying, and interacting with
dapps on Ethereum.

Use the default contracts or add your own. Any valid contract will work.
All you need is the JSON output from the Solidity compiler.

## Call for Contributors

DappGrapher is an open source project supported by [MetaMask](https://github.com/MetaMask).
We are welcoming contributors who want to help democratize smart contracts.
See [Contributions and Roadmap](#contributions-and-roadmap) for details.

## Installation & Usage
- Download the repo (branch: `master`)
- `npm install`
- Install and log in to MetaMask
  - DappGrapher has only been tested using Chrome
- Select an Ethereum network of your choice
  - For easier testing/development, use `npm run ganache` and connect to
  "Localhost 8545"
- `npm run start`
- For an example workflow, see [this video](https://www.youtube.com/watch?v=I9MR9Cba9is)

### Technical Notes
- Many bugs can be resolved by clearing your Chromium browser's local storage.

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
and pick an issue below or from the [Issues](https://github.com/rekmarks/dapp-grapher/issues) page.


### Immediate Goals



# todo
- review gdoc
- write immediate goals
- write longer-term goals
- add most critical issues here
- create public-facing version of gdoc?
- create some issues
- review repo for blocking issues
- make public

### check if this is in the gdoc
- Improve web3 error handling (currently perfunctory/unrealistic)
- Add `load-json-file` once `graceful-fs` has been updated for `create-react-app`
compatibility
    - Follow issue at: https://github.com/isaacs/node-graceful-fs/pull/135
- UX
    - Add modal that can only be closed by logging in to MetaMask
    (check using web3.eth.getAccounts() on a handler for a user-triggered
    event, like clicking "OK" in the modal)
        - utilize state.web3.ready (a boolean) to accomplish this
