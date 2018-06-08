const redshiftQuery = require('../utils/redshiftQuery')
const json2csv = require('json2csv')

exports.leadsCsv = async (broker, startDate, endDate) => {
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
	let data
	if (rows.length) {
		data = json2csv({data: rows})
	} else {
		data = `No records for ${broker} in between ${startDate} and ${endDate}`
	}
	return data
}
