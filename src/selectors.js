
import { createSelector } from 'reselect'

const getAccount = state => state.web3.account
const getNetworkId = state => state.web3.networkId
const getContractInstances = state => state.contracts.instances

export const selectContractInstances = createSelector(
  [getAccount, getNetworkId, getContractInstances],
  (account, networkId, instances) =>
    Object.values(instances)
      .filter(i => {
          return i.account === account && i.networkId === networkId
      })
      .reduce((acc, i) => {
          acc[i.id] = i
          return acc
      }, {})
)
