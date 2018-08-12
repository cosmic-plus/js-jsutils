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
