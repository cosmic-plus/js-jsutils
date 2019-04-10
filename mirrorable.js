"use_strict"
/**
 * Mirrorable arrays
 */

const hiddenKey = require("./misc").setHiddenProperty
const Projectable = require("./projectable")

const trapped = Projectable.trapped

const Mirrorable = module.exports = class Mirrorable extends Array {
  constructor (...params) {
    super(...params)
    hiddenKey(this, trapped, [])
    hiddenKey(this, "subscribers", [])
    initTraps(this)
  }

  mirror (func) {
    const array = new Mirrorable()
    this.subscribers.push([array, func])
    this.project("*", array, func)
    array.trap("*")
    hiddenKey(array, "destroy", () => {
      this.subscribers = this.subscribers.filter(x => x[0] !== array)
    })
    return array
  }

  feed (object, key, func) {
    const compute = func
      ? () => object[key] = func(this)
      : () => object[key] = this
    this.listen("change", compute)
    compute()
  }

  splice (i, suppr, ...objects) {
    if (this.length > this[trapped].length) initTraps(this)
    const removed = this.slice(i, suppr)
    const ret = this[trapped].splice(i, suppr, ...objects)
    updateTraps(this)
    propagate(this, objects, (array, values) => {
      array.splice(i, suppr, ...values)
    })
    removed.forEach(value => this.trigger("remove", value))
    objects.forEach(value => this.trigger("add", value))
    this.trigger("change")
    return ret
  }
}

Projectable.extend(Mirrorable)

/**
 * Methods that must to be reflected to subscribers
 */

function makeMethod (method, addFlag) {
  return function (...params) {
    if (this.length > this[trapped].length) initTraps(this)
    const ret = this[trapped][method](...params)
    updateTraps(this)
    propagate(this, params, (array, values) => array[method](...values))
    this.trigger("change")
    if (addFlag) params.forEach(value => this.trigger("add", value))
    else this.trigger("remove", ret)
    return ret
  }
}

const methods1 = ["push", "unshift"]
const methods2 = ["pop", "shift"]
methods1.forEach(
  method => Mirrorable.prototype[method] = makeMethod(method, true)
)
methods2.forEach(method => Mirrorable.prototype[method] = makeMethod(method))

/**
 * Helpers
 */

function initTraps (obj) {
  obj.forEach((_, key) => obj.trap(String(key), reflect, { init: false }))
}

function updateTraps (obj) {
  const diff = obj[trapped].length - obj.length
  if (diff < 0) removeTraps(obj)
  else if (diff > 0) addTraps(obj)
}

function addTraps (obj) {
  for (let key = obj.length; key < obj[trapped].length; key++) {
    obj[key] = obj[trapped][key]
    delete obj[trapped][key]
    obj.trap(String(key), reflect, { init: false })
  }
}

function removeTraps (obj) {
  for (let key = obj[trapped].length; key < obj.length; key++) {
    obj.forget(`change:${key}`)
  }
  Array.prototype.splice.call(
    obj,
    obj[trapped].length,
    obj.length - obj[trapped].length
  )
}

function reflect (event) {
  const { object, key, value } = event
  object.subscribers.forEach(entry => {
    const [array, func] = entry
    array[key] = func ? func(value) : value
  })
}

function propagate (object, params, func1) {
  object.subscribers.forEach(entry => {
    const [array, func2] = entry
    const values = func2 && params ? params.map(func2) : params
    func1(array, values)
  })
}
