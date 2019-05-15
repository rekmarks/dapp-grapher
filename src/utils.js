
export {
  getDisplayAddress,
  updateAccountNode,
}

/**
 * Truncates an Ethereum address for display purposes.
 *
 * @param {string} address the address to truncate
 */
function getDisplayAddress (address) {
  return address.slice(0, 6) + '...' + address.slice(address.length - 4)
}

/**
 * Updates the current account address in the given dapp graph if it exists.
 *
 * @param {object} dappGraph the graph to update
 * @param {string} address the new address to use
 * @return {object} the updated dappGraph
 */
function updateAccountNode (dappGraph, address) {

  const accountNode = dappGraph.elements.nodes['account:address']

  if (accountNode) {
    accountNode.address = address
    accountNode.displayName = getDisplayAddress(address)
  }
  return dappGraph
}
