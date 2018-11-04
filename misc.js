"use strict"
/**
 * Various independent helpers.
 *
 * @exports misc
 */
const misc = exports

const env = require("./env")
const html = env.isBrowser && require("./html")

/**
 * Return a function that will execute `thunk` when called, and return the
 * result of its execution as a Promise. Handle async and regular functions
 * equally. Any error will be carried to .catch.
 *
 * @param {function} thunk A parameterless function
 * @return {function}
 */
misc.delay = function (thunk) {
  let firstCall = true
  let memoized
  return function () {
    if (firstCall) {
      firstCall = false
      memoized = new Promise((resolve) => resolve(thunk()))
    }
    return memoized
  }
}

/**
 * Return a promise that takes `x` seconds to resolve
 *
 * @param {number} x Time to wait
 * @return {Promise}
 */
misc.timeout = function (x) {
  return new Promise(function (resolve) { setTimeout(resolve, x) })
}

/**
 * Return `string` with first letter capitalized.
 *
 * @param {string} string
 * @return {string}
 */
misc.capitalize = function (string) {
  return string.substr(0, 1).toUpperCase() + string.slice(1)
}

/**
 * Return shortified `string` if longer than 30 characters; else return
 * `string`.
 *
 * @param {string}
 * @return {string}
 */
misc.shorter = function (string) {
  if (string.length > 50) {
    return string.substr(0, 5) + "..." + string.substr(-5)
  } else {
    return string
  }
}

/**
 * Return a function that copy `string` into user clipboard.
 *
 * @private
 * @param {string} string
 * @return {function}
 */
misc.copy = env.isBrowser && function (string) {
  const textBox = html.create("textarea", {}, string)
  html.append(html.grab("body"), textBox)
  html.copyContent(textBox)
  html.destroy(textBox)
}

/**
 * Set `object` property `name` as hidden, and set it to `value`.
 */
misc.setHiddenProperty = function (object, name, value) {
  Object.defineProperty(object, name, { value: value, enumerable: false, writable: true })
}

/**
 * Log an error stating that `before` is deprecated.
 *
 * @param {string} date YYYY-MM or YYYY-MM-DD
 * @param {string} before Old function/property
 * @param {string} after New function/property
 */
misc.deprecated = function (date, before, after) {
  console.error(`Warning: ${before} is deprecated and will be removed after \
${date}. Please use ${after} instead.`)
}

/**
 * Creates and returns an extra field (`extra_ticot`) for **obj**. This allow to
 * append additional information to objects without mess.
 *
 * @param {Object}
 * @return {Object} The extra field object.
 */
misc.useExtra = function (obj) {
  if (!obj[extraField]) obj[extraField] = {}
  return obj[extraField]
}
const extraField = "_extra_ticot"
