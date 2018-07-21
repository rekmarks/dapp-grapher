/**
 * https://github.com/elgerlambert/redux-localstorage
 */

export default function mergeState(initialState, persistedState) {
  return persistedState
    ? {...initialState, ...persistedState}
    : initialState
}