"use_strict"
/**
 * Methods that allow to project an object changes toward another.
 */
const hiddenKey = require("./misc").setHiddenProperty
const Observable = require("./observable")

/**
 * Methods
 */
const method = {}
const trapped = ".trapped"

/**
 * Project properties **keys** to **dest** object each time they are updated. If
 * provided, apply **transformer** to those values.
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
 * @param  {Function} [transformer]
 */
method.project = function (keys, dest, transformer) {
  apply(this, keys, key => {
    this.link(key, dest, key, transformer)
  })
}

/**
 * Link projectable **srcKey** to **dest** **destKey**. If provided, apply
 * **transformer** to this value.
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
 */
method.link = function (
  srcKey,
  dest,
  destKey = srcKey,
  transformer,
  options = {}
) {
  const { init } = options
  const crossReference = this !== dest && dest
  const projector = transformer
    ? () => dest[destKey] = transformer(this[srcKey])
    : () => dest[destKey] = this[srcKey]

  this.trap(srcKey, projector, { crossReference, init })
}

/**
 * Creates a dynamic **definition** for **key** that is updated each time the
 * projectable properties it **depends** on are modified.
 *
 * @example
 * const projectable = new Projectable()
 * projectable.define("sum", ["a", "b"], () => projectable.a + projectable.b)
 * projectable.define("prod", ["a", "b"], () => projectable.a * projectable.b)
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
 * @param  {String} A property to be defined.
 * @param  {String|...String} depends One or more property it depends on.
 * @param  {Function} definition A function that compute the defined property.
 */
method.define = function (key, depends, definition) {
  const compute = function () {
    this[key] = definition.call(this)
  }
  this.trap(depends, compute)
  this.listen(`outdate:${key}`, compute)

  // If definition is not at constructor level, immediately compute property.
  if (this.trigger) compute()
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
  apply(this, keys, key => this.trigger(`outdate:${key}`))
}

/**
 * Trigger **callback** each time **projectable** **keys** changes. This method
 * takes care of cross-reference removal in case `this` or `projectable` gets
 * destroyed.
 *
 * @example
 * const projectable1 = new Projectable()
 * const projectable2 = new Projectable()
 *
 * projectable1.count = 1
 * projectable1.increment = () => projectable1.count++
 *
 * projectable2.outdated = false
 * projectable2.watch(projectable1, "count", () => projectable2.outdated = true)
 *
 * console.log(projectable2.outdated)  // => false
 * projectable1.increment()
 * console.log(projectable2.outdated)  // => true
 *
 * @param  {Projectable} projectable The source from which properties are red.
 * @param  {String|...String} keys One or more properties.
 * @param  {Function} [callback] A transformation to apply to those properties.
 */
method.watch = function (projectable, keys, callback, options = {}) {
  const { init } = options
  projectable.trap(keys, callback, { init, crossReference: this })
}

method.trap = function (keys, callback, options = {}) {
  if (options.init === undefined) options.init = true

  apply(this, keys, key => {
    trapKey(this, key)
    if (callback) {
      this.listen(`change:${key}`, callback, options.crossReference)
      if (!this.hasOwnProperty("prototype") && options.init) {
        callback.call(this, { object: this, key, value: this[key] })
      }
    }
  })
}

method.untrap = function (keys) {
  apply(this, keys, key => this.forget(`change:${key}`))
}

method.set = function (keys, value) {
  apply(this, keys, key => {
    if (this[trapped]) delete this[trapped][key]
    this[key] = value
  })
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
    get: function () {
      return this[trapped][key]
    },
    set: function (x) {
      setTrappedKey(this, key, x)
    },
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
