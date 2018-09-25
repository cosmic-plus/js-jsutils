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
const array = document.querySelectorAll('[id]')
for (let index in array) {
  const element = array[index]
  dom[element.id] = element
}
