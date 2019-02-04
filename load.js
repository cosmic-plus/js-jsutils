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
