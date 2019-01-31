"use_strict"
/**
 * Nice formating of numbers.
 *
 * @example
 * nice(35)                     // => 35.00
 * nice(35, 4)                  // => 35.0000
 * nice(35, { significant: 2})  // => 35
 * nice(35, { min: 3 })         // => 35.000
 * nice(35, { max: 1 })         // => 35.0
 *
 * @param  {String|Number} value The value to format
 * @param  {Number} [precision] Short form for `options.precision`
 * @param  {Object} [options]
 * @param  {Number} [options.precision=null] How much digit after the dot.
 *     Override options.significant.
 * @param  {Number} [options.significant=4] How much significant numbers (+/-
 *     one).
 * @param  {Number} [options.min=null] Minimum number of digits after the dot.
 * @param  {Number} [options.max=null] Maximum number of digits after the dot.
 * @return {String} The formatted value
 */
module.exports = function (value, opts = {}) {
  if (typeof opts === "number") opts = { precision: opts }

  if (value === undefined || isNaN(value)) return "..."
  else if (value == 0) return 0

  let precision = opts.precision || precisionAuto(Number(value), opts)
  if (opts.min) precision = Math.max(opts.min, precision)
  if (opts.max) precision = Math.min(opts.max, precision)
  return Number(value).toFixed(precision)
}


function precisionAuto (value, opts) {
  if (!opts.significant) opts.significant = 4
  let precision = 0

  const str = String(value)
  const firstNonZero = str.search(/[^0.]/)
  if (firstNonZero) {
    precision = firstNonZero + opts.significant - 2
  } else {
    const pointIndex = str.indexOf(".")
    if (pointIndex === -1) {
      precision = opts.significant - str.length
    } else if (pointIndex < opts.significant) {
      precision = opts.significant - pointIndex
    }
  }

  if (precision) precision = Math.round(precision / 2) * 2
  return precision > 0 ? precision : 0
}
