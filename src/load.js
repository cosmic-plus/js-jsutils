"use_strict"
/**
 * Asynchronously load external ressources.
 *
 * @exports load
 */
const load = exports

const html = require("./html")

/**
 * Asynchronously load a stylesheet from **href**.
 *
 * @example
 * // Load:
 * await load.css("my-styles.css")
 *
 * @example
 * // Preload:
 * const preloader = load.css("my-styles.css")
 *
 * // Then wait for loading to finish:
 * await cssLoader
 *
 * @async
 * @param {String} href
 */
load.css = async function (href) {
  return new Promise(function (resolve, reject) {
    const linkNode = html.create("link", {
      rel: "stylesheet",
      type: "text/css",
      href: href,
      onload: resolve,
      onerror: reject
    })
    html.append(document.head, linkNode)
  })
}

/**
 * Asynchronously load a script from **href**.
 *
 * @example
 * // Load:
 * await load.js("my-script.js")
 *
 * @example
 * // Preload:
 * const preloader = load.js("my-script.js")
 *
 * // Then wait for loading to finish:
 * await preloader
 *
 * @async
 * @param {String} href
 */
load.js = async function (href) {
  return new Promise(function (resolve, reject) {
    const scriptNode = html.create("script", {
      src: href,
      onload: resolve,
      onerror: reject
    })
    html.append(document.head, scriptNode)
  })
}
