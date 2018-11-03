"use_strict"
/**
 * Nice formating of numbers.
 *
 * @param  {String|Number} value The value to format
 * @param  {Number} [precision] How many significant numbers?
 * @return {String} The formatted value
 */
module.exports = function (value, precision) {
  if (value === undefined) return "..."
  else if (value === 0) return 0

  if (!precision) precision = precisionAuto(value)
  return Number(value).toFixed(precision)
}


function precisionAuto (value) {
  let precision = 0
  const str = "" + value
  const firstNonZero = str.search(/[^0.]/)
  if (firstNonZero) {
    precision = firstNonZero + 2
  } else {
    const pointIndex = str.indexOf(".")
    if (pointIndex === -1) precision = 4 - str.length
    else if (pointIndex < 4) precision = 4 - pointIndex
  }

  if (precision) precision = Math.round(precision / 2) * 2
  return precision
}
