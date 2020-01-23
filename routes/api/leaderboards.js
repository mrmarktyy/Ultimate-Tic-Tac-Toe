const keystone = require('keystone')
const Leaderboard = keystone.list('Leaderboard')

exports.list = async function (req, res) {
  let leaderboards = await Leaderboard.model.find({isDiscontinued: false}, {_id: 0}).lean().exec()
  res.jsonp(leaderboards)
}