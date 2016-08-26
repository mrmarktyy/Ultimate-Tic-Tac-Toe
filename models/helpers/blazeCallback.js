var fetch = require('node-fetch');

module.exports = function (modelName) {
  return function (model) {
    if (process.env.BLAZE) {
      var url = process.env.BLAZE + '/api/data/reindex/' + modelName + '?id=' + model.id
      fetch(url)
    }
  }
}
