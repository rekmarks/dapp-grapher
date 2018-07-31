/**
 * https://github.com/elgerlambert/redux-localstorage
 */

/**
 * @description
 * getSubset returns an object with the same structure as the original object passed in,
 * but contains only the specified keys and only if that key has a truth-y value.
 *
 * @param {Object} obj The object from which to create a subset.
 * @param {String[]} paths An array of (top-level) keys that should be included in the subset.
 *
 * @return {Object} An object that contains the specified keys with truth-y values
 */
export default function getSubset (obj, paths) {
  const subset = {}

  paths.forEach(key => {

    let branch
    if (key.indexOf('.') === -1) {

      branch = obj[key]
      if (branch) subset[key] = branch

    } else {

      const splitKey = key.split('.')

      // get target nested property
      const topKey = splitKey.shift()
      branch = {...obj[topKey]}
      splitKey.forEach(subKey => {
        branch = branch[subKey]
      })

      // rebuild path as object and add branch if it exists
      splitKey.reverse()
      splitKey.forEach(subKey => {
        branch = { [subKey]: branch}
      })
      if (branch) subset[topKey] = branch
    }
  })

  return subset
}
