"use_strict"
/**
 * Observable: extends Objects with listen/trigger capabilities.
 *
 * TODO: pass utils at prototype level
 */

const hiddenKey = require("./misc").setHiddenProperty

/**
 * Methods
 */

const method = {}
const listeners = ".listeners"

/**
 * Set **callback** as an event listener for **type**.
 *
 * @param {String} type
 * @param {Function} callback
 * @param {Object} crossRef
 */
method.listen = function (type, callback, crossRef) {
  if (!this.hasOwnProperty(listeners)) hiddenKey(this, listeners, {})
  if (!this[listeners][type]) this[listeners][type] = []
  this[listeners][type].push(callback)

  // Remove cross-references to allow garbage collection.
  if (crossRef && crossRef.listen) {
    const remover = () => {
      this.forget(type, callback)
      this.forget("destroy", remover)
      crossRef.forget("destroy", remover)
    }
    this.listen("destroy", remover)
    crossRef.listen("destroy", remover)
  }
}

/**
 * When both **type** and **callback** are provided, remove **callback** from
 * listening **type**.
 *
 * When only **type** is provided, remove all callbacks for **type**.
 *
 * When no parameter is provided, remove all callbacks for all events.
 *
 * @param  {String} type Event ID
 * @param  {Function} callback
 */
method.forget = function (type, callback) {
  if (!this.hasOwnProperty(listeners)) return
  if (!type) {
    this[listeners] = {}
  } else if (!callback) {
    delete this[listeners][type]
  } else if (this[listeners][type]) {
    this[listeners][type] = this[listeners][type].filter(x => x !== callback)
  }
}

/**
 * Trigger event **type**, with event object **event**.
 *
 * @param  {String} type
 * @param  {Object} event
 */
method.trigger = function (type, event = this) {
  // TODO: return instead of create listeners key
  if (!this.hasOwnProperty(listeners)) hiddenKey(this, listeners, {})
  if (this.constructor[listeners]) {
    callListeners(this, this.constructor[listeners][type], event)
  }
  callListeners(this, this[listeners][type], event)
}

function callListeners (context, listeners, event) {
  if (!listeners) return
  for (let index in listeners) {
    try {
      listeners[index].call(context, event)
    } catch (error) {
      console.error(error)
    }
  }
}

/**
 * Class
 */

const Observable = module.exports = class Observable {
  static extend (object) {
    if (object.hasOwnProperty("prototype")) {
      Object.assign(object, this.constructorMethods)
      this.extend(object.prototype)
    } else {
      Object.assign(object, this.instanceMethods)
    }
  }
}

Observable.constructorMethods = { listen: method.listen, forget: method.forget }
Observable.instanceMethods = method
Observable.extend(Observable)
