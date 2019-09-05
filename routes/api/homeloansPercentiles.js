var keystone = require('keystone')
var _ = require('lodash')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

const HomeLoanVariation = keystone.list('HomeLoanVariation')

exports.value = async function (req, res) {
  try {
    let rank = req.query.rank
    let name = req.query.name
    if (name  === undefined || rank === undefined) {
      throw 'Name or Rank must be added in query string'
    }
    rank = rank/100.00
    let sort = {[name]: 1}
    let valueClause = `$${name}`
    if (name === 'recommendedScore') {
      valueClause = { $multiply: [ '$monthlyClicks', recommendedMultiplier ] }
      sort = {monthlyClicks: 1}
    }

    let countVariations = await HomeLoanVariation.model.count({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).lean().exec()
    let recordNumber = Math.round(countVariations * rank) -1
    let variation = await HomeLoanVariation.model.aggregate(
          [{ $match: { $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] } },
          { $sort: sort },
          { $group: {
            _id: '_id',
            fieldList: {
              '$push': {
                uuid: '$uuid',
                value: valueClause,
              },
            },
          }},
          { $unwind: { path: '$fieldList', includeArrayIndex: 'rowCount' } },
          { $sort: {'fieldList.value': 1} },
          { $match: { rowCount: recordNumber } },
          { $replaceRoot: { newRoot: '$fieldList' } },
          { $project: { 'value': 1 } },
    ]).exec()
    res.jsonp(variation[0])  
  } catch (error) {
    res.jsonp({error: error})
  }
}
