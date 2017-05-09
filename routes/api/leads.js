var LeadReportService = require('../../services/reporting/LeadReport')
var json2csv = require('json2csv')

module.exports.json = function (req, res) {
  if (req.query.datetime) {
    LeadReportService(req.query.company, req.query.datetime).then((result) => {
      res.jsonp(result)
    })
  } else {
    LeadReportService(req.query.company).then((result) => {
      res.jsonp(result)
    })
  }
}

module.exports.csv = function (req, res) {
  LeadReportService(req.query.company).then((result) => {
    let headings = []
    let headingTitles = []
    for(let heading in result) {
      headings.push(heading)
    }
    var csv = json2csv({data: result})
    res.send(csv)
  })
}
