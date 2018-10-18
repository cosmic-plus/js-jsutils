'use_strict'
/**
 * Utilities to manipulate HTML element from javascript.
 *
 * Those may not be feature complete, as this library purpose is to ease
 * cosmic-lib and Stellar Authenticator development, rather than provide a
 * generic-case toolbox.
 *
 * @exports html
 */
const html = exports

/// Prevent node failure when accidentaly loading this file.
const env = require('./env')
const document = env.window ? env.window.document : undefined
if (env.isNode) console.error('@cosmic-plus/jsutils/html is a browser-only module')

/**
 * Append `childs` as the end of `element`.
 *
 * @param {HTMLElement} element
 * @param {...(HTMLElement|String|Error)} childs
 */
html.append = function (element, ...childs) {
  childs.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number' || child instanceof Error) {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  })
}

/**
 * Add `newClass` as an additionnal class for `element`.
 *
 * @param {HTMLElement} element
 * @param {string} newClass
 * */
html.appendClass = function (element, newClass) {
  element.className += ' ' + newClass
}

/**
 * Remove everything inside `element`.
 *
 * @param {HTMLElement} elements
 * */
html.clear = function (...elements) {
  elements.forEach(element => { element.innerHTML = '' })
}

/**
 * Copy text inside `element`. `element` should be a textbox like textarea or
 * text input.
 *
 * @param {HTMLElement} element
 * @param
 * */
html.copyContent = function (element) {
  /// Don't copy complete box content twice / when user made a selection.
  if (element.selectionStart !== element.selectionEnd) return

  if (element.select) {
    element.select()
  } else if (window.getSelection) {
    const range = document.createRange()
    range.selectNode(element)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
  } else {
    return
  }
  return document.execCommand('copy')
}

/**
 * Return a newly created HTML element whose tag is `name`, attributes
 * `attributes` and childs `childs`.
 *
 * @param {string} name
 * @param {object|string} [attributes|className|ID]
 * @param {...HTMLElement} [childs]
 */
html.create = function (name, attributes, ...childs) {
  if (!name) throw new Error('Missing tag name')

  const element = document.createElement(name)

  if (typeof attributes === 'string') {
    switch (attributes.substr(0, 1)) {
      case '#': element.id = attributes.substr(1); break
      case '.': element.className = attributes.substr(1); break
      default: throw new Error('Unhandled attribute')
    }
  } else {
    let field; for (field in attributes) {
      element[field] = attributes[field]
    }
  }

  if (childs.length > 0) html.append(element, ...childs)

  return element
}

/**
 * Destroy `element`.
 *
 * @param {HTMLElement} element
 * */
html.destroy = function (element) {
  try {
    element.innerHTML = ''
    if (element.parentNode) element.parentNode.removeChild(element)
  } catch (error) { console.error(error) }
}

/**
 * Return the first element matching `pattern`.
 * If `name` starts with `#`, it will match against IDs.
 * If `name` starts with `.`, it will match against classes.
 * If `name` is a plain word, it will match against tags.
 * If `parent` is given, it will look recursively in `parent` childs.
 *
 * @param {string} pattern
 * @param {HTMLElement} [parent=document]
 * */
html.grab = function (pattern, parent = document) {
  return parent.querySelector(pattern)
}

/**
 * Set the `style.display` property of `...elements` to `block`.
 *
 * @param {...HTMLElement} elements
 */
html.show = function (...elements) {
  elements.forEach(element => element.style.display = 'block')
}

/** Set the `style.display` property of `...elements` to `none`.
 *
 * @param {...HTMLElement} elements
 */
html.hide = function (...elements) {
  elements.forEach(element => element.style.display = 'none')
}

/**
 * Replace `element1` by `element2`.
 *
 * @param {HTMLElement} element1 The element to replace.
 * @param {HTMLElement} element2 The element to put in place of `element1`.
 */
html.replace = function (element1, element2) {
  element1.parentNode.replaceChild(element2, element1)
}

/**
 * Set the content of element to ...childs. Any previous content will be erased.
 *
 * @param {HTMLElement} element
 * @param {...HTMLElement} childs
 */
html.rewrite = function (element, ...childs) {
  html.clear(element)
  html.append(element, ...childs)
}

/**
 * Add `string` as additional CSS definitions for the current document.
 *
 * @param {string} styles CSS definitions
 */
html.addStyles = function (styles) {
  const styleNode = html.create('style', { type: 'text/css' }, styles)
  html.append(headNode, styleNode)
}
const headNode = html.grab('head')
