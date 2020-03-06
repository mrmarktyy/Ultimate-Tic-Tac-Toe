exports.parseBool = function (value) {
  if (typeof value === 'undefined') {
    return null
  }
  return value === 'true' || value === true
}
