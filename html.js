"use_strict"
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

const { deprecated } = require("./misc.js")

/// Prevent node failure when accidentaly loading this file.
const env = require("./env")
const document = env.window ? env.window.document : undefined
if (env.isNode) console.error("@cosmic-plus/jsutils/html is a browser-only module")

/**
 * Add `string` as additional CSS definitions for the current document.
 *
 * @param {string} styles CSS definitions
 */
html.addStyles = function (styles) {
  const styleNode = html.create("style", { type: "text/css" }, styles)
  html.append(document.head, styleNode)
}

/**
 * Append `childs` as the end of `element`.
 *
 * @param {HTMLElement} element
 * @param {...(HTMLElement|String|Error)} childs
 */
html.append = function (element, ...childs) {
  childs.forEach(child => { element.appendChild(html.convert(child)) })
}

/**
 * Add `className` as an additionnal class for `element`.
 *
 * @param {HTMLElement} element
 * @param {string} className
 * */
html.addClass = function (element, className) {
  const classes = element.className.split(" ")
  if (classes.indexOf(className) === -1) element.className += ` ${className}`
}

// Deprecated since 2019-01-16
html.appendClass = function (element, className) {
  deprecated("2019-07-16", "html.appendClass()", "html.addClass()")
  return html.addClass(element, className)
}

/**
 * Remove everything inside `element`.
 *
 * @param {HTMLElement} elements
 * */
html.clear = function (...elements) {
  elements.forEach(element => { element.innerHTML = "" })
}

/**
 * If **object** is not an *HTMLElement*, convert it to a text DOM node; else
 * return **object**.
 *
 * @param  {Object} object
 * @return {HTMLELement}
 */
html.convert = function (object) {
  // https://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object/36894871#36894871
  if (
    object instanceof Element
    || object instanceof HTMLDocument
    || object instanceof Text
  ) return object
  else if (object == null) return document.createTextNode("")
  else return object.domNode || document.createTextNode(object)
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
  return document.execCommand("copy")
}

/**
 * Copy `string` into user clipboard.
 *
 * @param {string} string
 */
html.copyString = function (string) {
  const textBox = html.create("textarea", {}, string)
  html.append(document.body, textBox)
  html.copyContent(textBox)
  html.destroy(textBox)
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
  const element = document.createElement(name)

  if (typeof attributes === "string") {
    switch (attributes.substr(0, 1)) {
    case "#": element.id = attributes.substr(1); break
    case ".": element.className = attributes.substr(1); break
    default: throw new Error("Unhandled attribute")
    }
  } else {
    Object.assign(element, attributes)
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
    if (element.parentNode) element.parentNode.removeChild(element)
    element.innerHTML = ""
  } catch (error) {
    console.error(error)
  }
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

/** Set the `style.display` property of `...elements` to `none`.
 *
 * @param {...HTMLElement} elements
 */
html.hide = function (...elements) {
  elements.forEach(element => element.hidden = true)
}

/**
 * Replace `element1` by `element2`.
 *
 * @param {HTMLElement} element1 The element to replace.
 * @param {HTMLElement} element2 The element to put in place of `element1`.
 */
html.replace = function (element1, element2) {
  const node = html.convert(element2)
  element1.parentNode.replaceChild(node, element1)
  return node
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
 * Set the `style.display` property of `...elements` to `block`.
 *
 * @param {...HTMLElement} elements
 */
html.show = function (...elements) {
  elements.forEach(element => element.hidden = false)
}
