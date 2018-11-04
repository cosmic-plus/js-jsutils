/**
 * A configurable service worker.
 */
const TIMEOUT = 2000

const ServiceWorker = module.exports = class ServiceWorker {
  /**
   * Create a new ServiceWorker.
   *
   * @param  {String} package Package name
   * @param  {String} version Package version
   * @param  {*} verbose ServiceWorker will be verbose if this parameter is set
   */
  constructor (name, version, verbose) {
    this.name = name
    this.version = version
    this.verbose = verbose
    this.hostname = location.host.replace(/:.*/,"")
    this.enabled = this.hostname !== "localhost" && this.hostname !== "127.0.0.1"
    this.root = `${location.protocol}//${location.host}/`
    this.startByRoot = new RegExp("^" + this.root)
    this.timeout = TIMEOUT
    this.cacheName = `${name}-${version}`
    this.files = {}
    this.get = []
  }

  /**
   * Log **message** if ServiceWorker is verbose.
   */
  log (message) {
    // eslint-disable-next-line no-console
    if (this.verbose) console.log(message)
  }

  /**
   * Set all previously defined files to be pre-cached when ServiceWorker
   * install itself.
   */
  precache () {
    this.get = Object.keys(this.files)
    return this
  }

  /**
   * Register ServiceWorker.
   */
  register () {
    self.addEventListener("install", (event) => {
      this.log(`Installing ${this.cacheName}...`)
      event.waitUntil(precache(this, this.get)
        .then(() => self.skipWaiting())
        .then(() => this.log(`${this.cacheName} installed`))
      )
    })

    self.addEventListener("activate", (event) => {
      event.waitUntil(wipeCachesExcept(this.cacheName))
    })

    self.addEventListener("fetch", (event) => {
      if (!this.enabled || event.request.method !== "GET") return
      if (!event.request.url.match(this.startByRoot)) return

      /// Strip out query string from request.
      const request = new Request(event.request.url.replace(/\?.*$/, ""))
      const filename = request.url.replace(this.startByRoot, "") || "index.html"

      const config = this.files[filename]
      if (config && strategy[config]) {
        event.respondWith(strategy[config](this, request, filename))
      } else {
        event.respondWith(strategy.fromNetwork(this, request, filename))
      }
    })
  }
}

/**
 * Cache **files** into `worker.cacheName`.
 */
function precache (worker, files) {
  return caches.open(worker.cacheName).then(cache => cache.addAll(files))
}

/**
 * Wipe every caches except **cacheName**.
 */
function wipeCachesExcept (cacheName) {
  return caches.keys().then(function (keys) {
    return Promise.all(
      keys.map(key => { if (key !== cacheName) caches.delete(key) })
    )
  })
}


/*******************************************************************************
 * Strategies
 */
const strategy = {}

/**
 * Fetch **request** from cache or reject.
 */
strategy.fromCache = function (worker, request, filename) {
  worker.log(`Looking for ${filename} into ${worker.cacheName} cache...`)
  return caches.open(worker.cacheName).then(cache => cache.match(request))
}

/**
 * Fetch **request** from network or reject after **timeout**.
 */
strategy.fromNetwork = function (worker, request, filename) {
  worker.log(`Downloading ${filename}...`)
  return new Promise(function (resolve, reject) {
    const timeoutId = setTimeout(reject, worker.timeout)
    return fetch(request).then(function (response) {
      clearTimeout(timeoutId)
      resolve(response)
    })
  })
}

/**
 * Resolve **request** using cache, or download and cache.
 */
strategy.cacheOrNetwork = async function (worker, request, filename) {
  const cached = await strategy.fromCache(worker, request, filename)
  if (cached) return cached

  const response = await strategy.fromNetwork(worker, request, filename)
  cacheResponse(worker, request, response)
  return response
}

/**
 * Cache **response** to **request** into **worker** cache.
 */
function cacheResponse (worker, request, response) {
  const cacheCopy = response.clone()
  caches.open(worker.cacheName).then(cache => cache.put(request, cacheCopy))
}

/*******************************************************************************
 * Merge strategies into ServiceWorker.
 */

for (let key in strategy) {
  ServiceWorker.prototype[key] = function (array) {
    array.forEach(filename => this.files[filename] = key)
    return this
  }
}