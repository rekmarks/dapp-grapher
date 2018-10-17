# dapp-grapher
Takes one or several smart contracts as inputs and represents their relationships as a grapher

# dev notes
- Incompatibilities between `create-react-app` and `graceful-fs` means that changes must be applied manually per the following PR until the latter is patched

# todo
- Improve web3 error handling (currently perfunctory/unrealistic)
- Add `load-json-file` once `graceful-fs` has been updated for `create-react-app` compatibility
    - Follow issue at: https://github.com/isaacs/node-graceful-fs/pull/135
- UX
    - Add modal that can only be closed by logging in to MetaMask (check using web3.eth.getAccounts() on a handler for a user-triggered event, like clicking "OK" in the modal)
        - utilize state.web3.ready (a boolean) to accomplish this
