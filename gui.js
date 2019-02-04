"use_strict"
/**
 * Component-driven GUI Development
 *
 * API:
 *
 * Reference: -ref=%alias
 * Group:     -group=%alias
 * Label:     -label="text"
 *
 * Attribute: %attr | attr=%alias | attr=%func:alias
 * Content: %alias | %func:alias | %{alias} | %{func:alias}
 *          %alias... | %func:alias... | %{alias...} | %{func:alias...}
 * Escape: \%example | \%{example}
 */

const html = require("./html")
const Projectable = require("./projectable")

/**
 * Class
 */

module.exports = class Gui extends Projectable {
  constructor (template = "", values) {
    super()
    const domTree = html.create("template")
    domTree.innerHTML = expand(
      template.replace(/^[\s\n]*/, "").replace(/[\s\n]*$/, "")
    )

    // IE doesn't use .content for template tag
    const content = domTree.content || domTree
    if (
      content.childNodes.length > 1
      || content.childNodes[0].dataset.type === "ellipsis"
    ) {
      this.domNode = html.create("div", null, ...content.childNodes)
    } else {
      this.domNode = content.childNodes[0]
    }
    html.addClass(this.domNode, this.__proto__.constructor.name)

    Object.defineProperty(this, "domNode", {
      enumerable: false,
      writable: false
    })

    rewriteNode(this, this.domNode)

    if (values) {
      const keys = Object.keys(this)
      const keysFiltered = keys.filter(key => key !== "style")
      if (values instanceof Projectable) values.project(keysFiltered, this)
      else keysFiltered.forEach(key => this[key] = values[key])
    }

    this.listen("destroy", () => this.domNode.innerHTML = null)
  }
}

/**
 * Parser
 */

function expand (template) {
  // Apply only on content outside of HTML tags.
  return template.replace(/(^|>)[^<>]*(<|$)/g, string =>
    string
      // %function:identifier...
      .replace(/%(\w+):(\w+)\.\.\./g, ellipsis)
      // %identifier...
      .replace(/%()(\w+)\.\.\./g, ellipsis)
      // %{function:identifier...}
      .replace(/%{(\w+):(\w+)\.\.\.}/g, ellipsis)
      // %{identifier...}
      .replace(/%{()(\w+)\.\.\.}/g, ellipsis)
      // %function:identifier
      .replace(/%(\w+):(\w+)/g, variable)
      // %identifier
      .replace(/%()(\w+)/g, variable)
      // %{function:identifier}
      .replace(/%{(\w+):(\w+)}/g, variable)
      // %{identifier}
      .replace(/%{()(\w+)}/g, variable)
  )
}

function ellipsis (_, func, identifier) {
  return `<template data-type="ellipsis" data-func="${func}">${identifier}</template>`
}

function variable (_, func, identifier) {
  return `<template data-type="variable" data-func="${func}">${identifier}</template>`
}

/**
 * Rewriter
 */

function rewriteNode (obj, el) {
  if (el.attributes) rewriteAttributes(obj, el)
  if (el.nodeName === "TEMPLATE") rewriteTemplate(obj, el)
  let prev = null
  el.childNodes.forEach(child => {
    if (child === prev) confirm("houla")
    rewriteNode(obj, child)
    prev = child
  })
}

function rewriteAttributes (obj, el) {
  Object.values(el.attributes)
    .filter(x => x.name)
    .forEach(attribute => {
      if (attribute.name === "-ref" && attribute.value.match(/%(\w+)/)) {
        obj[attribute.value.substr(1)] = el
      } else if (attribute.name === "-label") {
        const node = html.create(
          "label",
          { for: el, onclick: () => el.click() },
          html.create("span", null, attribute.value)
        )
        el.parentNode.insertBefore(node, el.nextSibling)
        // TODO: better aliases for :group
      } else if (
        attribute.name === "-group"
        && attribute.value.substr(0, 1) === "%"
      ) {
        const key = attribute.value.substr(1)
        if (!obj[key]) obj[key] = { name: uniqueName(), childs: [] }
        obj[key].childs.push(el)
        el.group = obj[key]
        el.name = obj[key].name
        el.onchange = groupEvent
      } else if (attribute.name.match(/^%\w+$/)) {
        const src = attribute.name.substr(1)
        linkAttribute(obj, src, el, src)
        el.attributes.removeNamedItem(attribute.name)
      } else if (attribute.value.match(/^%\w*:\w*$/)) {
        const dest = attribute.name
        const [func, src] = attribute.value.substr(1).split(":")
        linkAttribute(obj, src, el, dest, obj[func])
      } else if (attribute.value.match(/^%\w*$/)) {
        const dest = attribute.name
        const src = attribute.value.substr(1)
        linkAttribute(obj, src, el, dest)
      }
    })
}

function linkAttribute (obj, src, el, dest, func) {
  if (dest === "class") dest = "className"
  if (dest === "style") obj[src] = el.style

  // Make sure two-way binding happens before onchange/onclick event.
  // TODO: check if a clearer way exists.
  if (
    (el.tagName === "INPUT" || el.tagName === "SELECT")
    && dest.substr(0, 2) === "on"
  ) {
    const key = dest
    dest = `.${dest}`
    el[key] = event => setTimeout(() => el[dest] && el[dest](event), 1)
  }

  const transformer = func ? func.bind(obj) : functionBinder.bind(obj)
  obj.link(src, el, dest, transformer, null, true)

  // Two-ways binding.
  if (
    el.tagName === "SELECT"
    && (dest === "value" || dest === "selectedIndex" || dest === "selectedOptions")
  ) {
    el.addEventListener("change", () => obj[src] = el[dest])
  } else if (
    el.tagName === "INPUT"
    && el.type !== "radio"
    && (el.type !== "checkbox" && dest === "value"
      || el.type === "checkbox" && dest === "checked")
  ) {
    el.addEventListener("change", () => obj[src] = el[dest])
  } else if (
    el.tagName === "INPUT"
    && el.type === "radio"
    && dest === "checked"
  ) {
    el.addEventListener("change", event => {
      obj[src] = el[dest]
      groupEvent(event)
    })
  }
}

function rewriteTemplate (object, el) {
  if (el.dataset.type === "variable") rewriteVariable(object, el)
  else if (el.dataset.type === "ellipsis") rewriteEllipsis(object, el)
}

function rewriteVariable (object, el) {
  let currentNode = el

  const key = el.innerHTML
  const func = el.dataset.func && object[el.dataset.func]
  const replacer = func
    ? () => {
      currentNode = html.replace(currentNode, func(object[key]))
    }
    : () => {
      currentNode = html.replace(currentNode, object[key])
    }

  object.trap(key, replacer, null, true)

  // Two-way binding
  // if (parent.tagName === "TEXTAREA" &&)
}

function rewriteEllipsis (obj, el) {
  const key = el.innerHTML
  const func = el.dataset.func && obj[el.dataset.func]

  let ellipsis = [],
    ref = html.convert("")
  html.replace(el, ref)
  const compute = array => {
    ellipsis = expandEllipsis(ref, ellipsis, array)
  }

  const update = function (event) {
    // TODO: better memory management
    if (event.old && typeof event.old.forget === "function") {
      event.old.forget("change", compute)
    }
    if (event.value && typeof event.value.mirror === "function") {
      if (func) event.value.mirror(func.bind(this)).listen("change", compute)
      else event.value.listen("change", compute)
    }
    if (func && event.value) compute(event.value.map(func))
    else compute(event.value)
  }
  obj.trap(key, update, null, true)
}

function expandEllipsis (ref, oldNodes, array = []) {
  const parent = ref.parentNode
  oldNodes.forEach(node => {
    if (node.parentNode === parent) {
      parent.removeChild(node)
    }
  })

  const ellipsis = []
  array.forEach(entry => {
    const node = html.convert(entry)
    ellipsis.push(node)
    parent.insertBefore(node, ref)
  })

  return ellipsis
}

/**
 * Helpers
 */

const uniqueName = (function () {
  let counter = 0
  return function () {
    counter++
    return `group.${counter}`
  }
})()

function groupEvent (event) {
  if (!event) return
  const el = event.srcElement
  el.group.value = el.value
  el.group.childs.forEach(child => {
    if (child !== el && child.onchange) child.onchange()
  })
}

function functionBinder (value) {
  if (typeof value === "function") return value.bind(this)
  else return value
}
