'use_strict'
/**
 * A simple module that ease access to HTML DOM nodes. Any HTML element having
 * an `id` at loading time is registered at dom[id]. This is to avoid running
 * `querySelector` multiple times.
 *
 * @exports dom
 */
const dom = exports

const html = require('./html')

/// Prevent node failure when accidentaly loading this file.
const env = require('./env')
const document = env.window ? env.window.document : undefined
if (env.isNode) console.error('@cosmic-plus/jsutils/dom is a browser-only module')

/**
 * Add to dom all **element** child having an `id=` attribute.
 */
function ingest (element = document) {
  const array = element.querySelectorAll('[id]')
  for (let index in array) {
    const element = array[index]
    if (element.id) dom[element.id] = element
  }
}
Object.defineProperty(dom, 'ingest',
  { value: ingest, enumerable: false, writable: false })

/**
 * Main tags.
 */
dom.html = html.grab('html')
dom.head = html.grab('head')
dom.body = html.grab('body')
dom.header = html.grab('header')
dom.main = html.grab('main')
dom.footer = html.grab('footer')

/**
 * All elements having an ID.
 */
dom.ingest()
