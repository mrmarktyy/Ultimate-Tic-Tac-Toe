const round = require('../comparisonRateCalculator').round

module.exports = function (flexibilityScore, highestFlexibilityScore, lowestFlexibilityScore) {
  if (highestFlexibilityScore === lowestFlexibilityScore) {
    return 1
  } else {
    return round(5 * (flexibilityScore / highestFlexibilityScore), 2)
  }
}
