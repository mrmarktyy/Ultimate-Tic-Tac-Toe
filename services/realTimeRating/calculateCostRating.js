const round = require('../ComparisonRateCalculator').round

module.exports =  function (averageMonthlyCost, lowestMonthlyCost) {
  const maxScore = 10
  const minScore = 5
  const scalingFactor = 1.2
  const phaseFactor = 0.5

  const indexScore = 5 * (averageMonthlyCost / lowestMonthlyCost)

  let costRating = maxScore - (scalingFactor * (indexScore - minScore)) - minScore + phaseFactor

  if (costRating < 1) {
    costRating = 1
  }

  if (costRating > 5) {
    costRating = 5
  }

  return round(costRating, 3)
}
