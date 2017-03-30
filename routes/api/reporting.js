var ClientReportService = require('../../services/reporting/ClientReport')
var json2csv = require('json2csv')

module.exports.json = function (req, res) {
  ClientReportService(req.query.company, parseInt(req.query.year), parseInt(req.query.month)).then((result) => {
    res.jsonp(result)
  })
}

module.exports.csv = function (req, res) {
  ClientReportService(req.query.company, parseInt(req.query.year), parseInt(req.query.month)).then((result) => {
    let headings = []
    let headingTitles = []
    for(let heading in result.mappings) {
      headings.push(heading)
      headingTitles.push(result.mappings[heading])
    }
    var csv = json2csv({data: result.days, fields: headings, fieldNames: headingTitles})
    res.send(csv)
  })
}
