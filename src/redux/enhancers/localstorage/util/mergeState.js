/**
 * https://github.com/elgerlambert/redux-localstorage
 */

export default function mergeState (initialState, persistedState) {
  const merged = {}
  Object.keys(initialState).forEach(key => {
    merged[key] = {...initialState[key], ...persistedState[key]}
  })
  return merged
}
