const csv = require('csvtojson')

module.exports = function (csvFilePath) {
  let list = []
  return new Promise((resolve) => {
    csv()
    .fromFile(csvFilePath)
    .on('end_parsed', (jsonArray) => {
      list = jsonArray
    })
    .on('done', (error) => {
      if (error) return error
      resolve(list)
    })
  })
}
