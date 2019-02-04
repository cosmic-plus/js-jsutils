"use_strict"
/**
 * Methods that allow to project an object changes toward another.
 *
 * TODO: pass utils at prototype level
 *
 * @type {[type]}
 */
const hiddenKey = require("./misc").setHiddenProperty
const Observable = require("./observable")

/**
 * Methods
 */
const method = {}
const trapped = ".trapped"

/**
 * Project **keys** to **dest**. If provided, apply **transformer** to the
 * values.
 *
 * @example
 * const projectable = new Projectable()
 * const destination = {}
 *
 * projectable.project("foo", destination)
 * projectable.project(["bar", "baz"], destination, x => x * 2)
 *
 * projectable.foo = "Hello, world!"
 * projectable.bar = 2
 * projectable.baz = 50
 *
 * console.log(destination.foo)    // => "Hello, world!"
 * console.log(destination.bar)    // => 4
 * console.log(destination.baz)    // => 100
 *
 * @param  {String|...String} keys
 * @param  {Object} dest
 * @param  {Function} [func]
 * @return {undefined}
 */
method.project = function (keys, dest, transformer, skip) {
  apply(this, keys, key => this.link(key, dest, key, transformer, skip))
}

/**
 * Link projectable **srcKey** to **dest** **destKey**. If provided, apply
 * **transformer** to the values.
 *
 * @example
 * const projectable = new Projectable()
 * const destination = {}
 *
 * projectable.link("foo", destination, "bar")
 * projectable.link("one", destination, "two", x => x.toUpperCase())
 * projectable.link("baz", destination)
 *
 * projectable.foo = 50
 * projectable.one = "Hi, all!"
 * projectable.baz = 125
 *
 * console.log(destination.foo)    // => undefined
 * console.log(destination.bar)    // => 50
 * console.log(destination.one)    // => undefined
 * console.log(destination.two)    // => "HI, ALL!"
 * console.log(destination.baz)    // => 125
 *
 * @param  {String} srcKey
 * @param  {Object} dest
 * @param  {String} [destKey=srcKey]
 * @param  {Function} [transformer]
 * @return {undefined}
 */
method.link = function (srcKey, dest, destKey = srcKey, transformer, skip) {
  const projector = transformer
    ? () => dest[destKey] = transformer(this[srcKey])
    : () => dest[destKey] = this[srcKey]
  this.trap(srcKey, projector, dest, skip)
}

/**
 * Creates a dynamic **definition** for **key**, that is updated each time the
 * projectable properties it depends on are modified.
 *
 * @example
 * const projectable = new Projectable()
 * projectable.define("sum", (a, b) => a + b)
 * projectable.define("prod", (a, b) => a * b)
 *
 * projectable.a = 3
 * projectable.b = 5
 * console.log(projectable.sum)     // => 8
 * console.log(projectable.prod)    // => 15
 *
 * projectable.a = 10
 * console.log(projectable.sum)     // => 15
 * console.log(projectable.prod)    // => 50
 *
 * @param  {String} key
 * @param  {Function} definition
 * @return {undefined}
 */
method.define = function (key, definition, skip) {
  const params = functionParameters(definition)
  const compute = function () {
    const args = params.map(x => this[x])
    this[key] = definition.apply(this, args)
  }
  this.trap(params, compute, skip)
  this.listen(`compute:${key}`, compute)
}

/**
 * Compute **keys** for which a [definition]{@link Projectable.define} exists.
 *
 * @example
 * const projectable = new Projectable()
 * projectable.define("timestamp", () => new Date().getTime())
 *
 * projectable.compute("timestamp")
 * console.log(projectable.compute)    // => "1547044395000"
 *
 * projectable.compute("timestamp")
 * console.log(projectable.compute)    // => "1547044460000"
 *
 * @param  {String|...String} keys
 * @return {undefined}
 */
method.compute = function (keys) {
  apply(this, keys, key => this.trigger(`compute:${key}`))
}

method.trap = function (keys, callback, source, skip) {
  apply(this, keys, key => {
    trapKey(this, key)
    if (callback) {
      this.listen(`change:${key}`, callback, source)
      if (!this.hasOwnProperty("prototype") && !skip) {
        callback.call(this, { object: this, key, value: this[key] })
      }
    }
  })
}

/**
 * Trigger the `destroy` event and remove all cross-references.
 */
// TODO: move this to observable?
method.destroy = function () {
  this.trigger("destroy")
  Object.getOwnPropertyNames(this).forEach(key => delete this[key])
}

/**
 * Key trapping
 */

function trapKey (object, key) {
  if (object.hasOwnProperty("prototype")) object = object.prototype
  if (object[trapped] && object[trapped].hasOwnProperty(key)) return

  setTrappedProperty(object)
  object[trapped][key] = object[key]

  Object.defineProperty(object, key, {
    get: () => object[trapped][key],
    set: x => setTrappedKey(object, key, x),
    configurable: true,
    enumerable: true
  })
}

function setTrappedKey (object, key, value) {
  setTrappedProperty(object)
  const old = object[trapped][key]
  if (value !== old) {
    object[trapped][key] = value
    const event = { object, key, value, old }
    object.trigger(`change:${key}`, event)
    object.trigger("change", object)
  }
}

function setTrappedProperty (object) {
  if (!object.hasOwnProperty(trapped)) {
    const backup = object[trapped]
    hiddenKey(object, trapped, {})
    if (backup) Object.assign(object[trapped], backup)
  }
}

/**
 * Class
 */

const Projectable = module.exports = class Projectable extends Observable {}
Projectable.constructorMethods = Object.assign(
  { define: method.define, trap: method.trap },
  Observable.constructorMethods
)
Projectable.instanceMethods = Object.assign(method, Observable.instanceMethods)
Projectable.extend(Projectable)
Projectable.trapped = trapped

/**
 * Helpers
 */

function apply (object, keys, func) {
  if (keys === "*") keys = Object.keys(object)
  if (keys instanceof Array) keys.forEach(x => func(x))
  else if (typeof keys === "string") func(keys)
}

function functionParameters (func) {
  const funcString = func.toString()
  const paramsString = funcString.slice(
    funcString.indexOf("(") + 1,
    funcString.indexOf(")")
  )
  return paramsString.match(/([^\s,]+)/g) || []
}
