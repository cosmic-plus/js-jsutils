"use_strict"
/**
 * Methods to detect in which environment we're running.
 *
 * @exports env
 */
const env = exports

/**
 * `true` if we are in a browser environment, `false` otherwise.
 */
env.isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined"

/**
 * `true` if we are in a node.js environment, `false` otherwise.
 */
env.isNode = typeof process !== "undefined" && process.versions && process.versions.node

/**
 * `true` if current page is embedded.
 */
env.isEmbedded = env.isBrowser && window.self !== window.top

/**
 * The window object, or `undefined`.
 */
env.window = env.isBrowser && window

/**
 * The global objet, or `undefined`.
 */
env.global = env.isNode && global

/**
 * A require that only have effect in Node.js and that is invisible package
 * bundlers.
 */
env.nodeRequire = () => {}
if (env.isNode) {
  const stealth_require = eval("require")
  env.nodeRequire = (module) => stealth_require(module)
}
