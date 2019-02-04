"use strict"
/**
 * Exports parsed query string parameters. If the same parameter is defined
 * twice, the last value is exported.
 *
 * @exports params
 */
const params = module.exports

const hiddenKey = require("./misc").setHiddenProperty

if (location.search) {
  const vars = location.search.substr(1).split("&")
  vars.forEach(entry => {
    const field = entry.split("=", 1)[0]
    const value = entry.substr(field.length + 1)
    params[field] = decodeURIComponent(value)
  })
}

hiddenKey(params, "$set", function (obj) {
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (value == null) delete params[key]
    else params[key] = value
  })
  writeQuery()
})

function writeQuery () {
  let query = ""
  for (let field in params) {
    query += `&${field}=${encodeURIComponent(params[field])}`
  }
  query = "?" + query.substr(1)
  if (location.hash) query += location.hash
  history.replaceState("", null, query)
}
