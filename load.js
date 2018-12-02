"use_strict"
/**
 * Asynchronously load external ressources.
 *
 * @exports load
 */
const load = exports

const html = require("./html")

/**
 * Asynchronously load a CSS from **href**.
 *
 * @example
 * // Preload at script initialization:
 * const cssLoader = cosmicLib.load.css("my-styles.css")
 *
 * // Wait for loading to finish:
 * await cssLoader
 *
 * @async
 * @param {String} href
 */
load.css = async function (href) {
  return new Promise(function (resolve, reject) {
    const linkNode = html.create("link", {
      rel: "stylesheet", type: "text/css", href: href,
      onload: resolve, onerror: reject
    })
    html.append(document.head, linkNode)
  })
}
