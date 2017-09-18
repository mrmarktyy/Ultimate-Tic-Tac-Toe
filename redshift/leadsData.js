const redshiftQuery = require('../utils/redshiftQuery')
const moment = require('moment')
const json2csv = require('json2csv')

exports.leadsCsv = async (broker, month, year) => {
	let yearValue = year || moment().year()
	let date = moment(`1-${month}-${yearValue}`, 'DD-MMM-YYYY')
	let startDate = date.format('YYYY-MM-DD')
	let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD')
	let command = `
		SELECT * FROM user_homeloan_leads
		WHERE created_at between $1 and $2 and broker_slug = $3
  `
	let rows = await redshiftQuery(command, [startDate, endDate, broker])
	return json2csv({data: rows})
}
