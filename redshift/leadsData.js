const redshiftQuery = require('../utils/redshiftQuery')
const moment = require('moment')
const json2csv = require('json2csv')

exports.leadsCsv = async (broker, month, year) => {
	let yearValue = year || moment().year()
	let date = moment(`1-${month}-${yearValue}`, 'DD-MMM-YYYY')
	let startDate = date.format('YYYY-MM-DD')
	let endDate = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM-DD')
	let command, rows, params

	if (broker === 'All') {
		command = `
			SELECT * FROM user_homeloan_leads
			WHERE created_at between $1 and $2
		`
		params = [startDate, endDate]
	} else {
		command = `
			SELECT * FROM user_homeloan_leads
			WHERE created_at between $1 and $2 and broker_slug = $3
  	`
		params = [startDate, endDate, broker]
	}
	rows = await redshiftQuery(command, params)

	return json2csv({data: rows})
}
