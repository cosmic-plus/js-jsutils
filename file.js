'use_strict'
/**
 * Utilities to save/load files. Currently works only in browser environment.
 *
 * @exports file
 */
const file = exports

const html = require('./html')

/**
 * Read file from user `path`.
 *
 * @param {string} path
 */
file.load = function (path) {
  const fileReader = new FileReader()
  fileReader.readAsText(path)

  const promise = new Promise(resolve => {
    fileReader.onload = event => resolve(event.target.result)
  })

  return promise
}

/**
 * Save `data` under `filename`. The user will have the choice over the path.
 *
 * @param {string} filename
 * @param {string} data
 */
file.save = function (filename, data) {
  const a = html.create('a', {
    href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(data),
    download: filename
  })
  html.append(document.body, a)
  a.click()
  html.destroy(a)
}
