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
 * Add **eventHandler** as an event listener for **eventName**.
 *
 * @param {String} eventName
 * @param {Function} eventHandler
 * @param {Object} [crossReference]
 */
method.listen = function (eventName, eventHandler, crossReference) {
  if (!this.hasOwnProperty(listeners)) hiddenKey(this, listeners, {})
  if (!this[listeners][eventName]) this[listeners][eventName] = []
  this[listeners][eventName].push(eventHandler)

  // Automatically remove cross-references to allow garbage collection.
  if (crossReference && crossReference.listen) {
    const onObservableDestruction = () => {
      crossReference.forget("destroy", onCrossReferenceDestruction)
    }
    const onCrossReferenceDestruction = () => {
      this.forget(eventName, eventHandler)
      this.forget("destroy", onObservableDestruction)
    }

    this.listen("destroy", onObservableDestruction)
    crossReference.listen("destroy", onCrossReferenceDestruction)
  }
}

/**
 * When both parameters are provided, remove **eventHandler** from **eventName**
 * listeners. When only **eventName** is provided, clear all its listeners.
 * When no parameter is provided, remove all listeners for all events.
 *
 * @param  {String} [eventName]
 * @param  {Function} [eventHandler]
 */
method.forget = function (eventName, eventHandler) {
  if (!this.hasOwnProperty(listeners)) return
  if (!eventName) {
    this[listeners] = {}
  } else if (!eventHandler) {
    delete this[listeners][eventName]
  } else if (this[listeners][eventName]) {
    this[listeners][eventName] = this[listeners][eventName].filter(
      listener => listener !== eventHandler
    )
  }
}

/**
 * Call **eventName** listeners with parameter **eventObject**.
 *
 * @param  {String} eventName
 * @param  {Object} eventObject
 */
method.trigger = function (eventName, eventObject = this) {
  // TODO: return instead of create listeners key
  if (!this.hasOwnProperty(listeners)) hiddenKey(this, listeners, {})
  if (this.constructor[listeners]) {
    callListeners(this, this.constructor[listeners][eventName], eventObject)
  }
  callListeners(this, this[listeners][eventName], eventObject)
}

function callListeners (context, listeners, eventObject) {
  if (!listeners) return
  for (let index in listeners) {
    try {
      listeners[index].call(context, eventObject)
    } catch (error) {
      console.error(error)
    }
  }
}

/**
 * Trigger the **destroy** event which removes all cross-references and own
 * properties.
 */
method.destroy = function () {
  this.trigger("destroy")
  Object.getOwnPropertyNames(this).forEach(key => delete this[key])
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
