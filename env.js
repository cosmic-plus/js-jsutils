'use_strict'
/**
 * Methods to detect in which environment we're running.
 *
 * @exports env
 */
const env = exports

/**
 * `true` if we are in a browser environment, `false` otherwise.
 */
env.isBrowser = new Function('try { return this === window } catch (e) { return false }')()

/**
 * `true` if we are in a node.js environment, `false` otherwise.
 */
env.isNode = new Function('try { return this === global } catch (e) { return false }')()

/**
 * The window object, or `undefined`.
 */
env.window = new Function('try { return window } catch (e) { return undefined }')()

/**
 * The global objet, or `undefined`.
 */
env.global = new Function('try { return global } catch (e) { return undefined }')()

/**
 * A require that only have effect in Node.js and that is invisible to web
 * application packagers.
 */ 

env.nodeRequire = function (module) {
  if (env.isNode) return stealth_require(module)
}

/**
 * A require that is invisible to web application packagers.
 */
const stealth_require = env.isNode && eval('require')

///**
 //* A require that only have effect in browser environment.
 //*/
//env.browserRequire = function (module) {
  //if (env.isBrowser) return require(module)
//}
