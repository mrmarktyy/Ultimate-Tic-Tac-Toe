const _ = require('lodash')
const auroraQuery = require('../utils/auroraQuery')
const json2csv = require('json2csv')

const columns = {
	users: ['first_name', 'middle_name', 'last_name', 'gender', 'dob', 'email', 'phone', 'address', 'postcode', 'suburb', 'state',
		'address_previous', 'lived_less_than_3_years', 'driver_licence', 'australian_citizen', 'credit_score_band_range', 'credit_score_band_name',
		'marital_status',
	],
	leads_hl: ['employed_status', 'loan_purpose', 'property_found'],
	leads_cl: ['employed_status', 'car_found'],
	leads_pl: ['employed_status', 'loan_amount', 'loan_term', 'loan_purpose', 'income_type', 'income', 'have_home_loan'],
	leads_sp: ['interested_service'],
}

const selectBuilder = () => {
	return Object.keys(columns).map((table) => {
		return columns[table].map((column) => `rc_${table}.${column} as "${table.replace('leads_', '')}.${column}"`).join(',')
	}).join(',')
}

exports.leadsCsv = async (broker, startDate, endDate) => {
	let command, params
	const selector = selectBuilder()

	if (broker === 'All') {
		command = `
			SELECT rc_leads.*,
			${selector}
			FROM rc_leads
			LEFT JOIN rc_leads_pl ON rc_leads.id = rc_leads_pl.id
			LEFT JOIN rc_leads_hl ON rc_leads.id = rc_leads_hl.id
			LEFT JOIN rc_leads_cl ON rc_leads.id = rc_leads_cl.id
			LEFT JOIN rc_leads_sp ON rc_leads.id = rc_leads_sp.id
			LEFT JOIN rc_users ON rc_leads.email = rc_users.email
			WHERE
			rc_leads.created_at >= $1 AND
			rc_leads.created_at < $2
			ORDER BY rc_leads.created_at DESC
		`
		params = [startDate, endDate]
	} else {
		command = `
			SELECT rc_leads.*,
			${selector}
			FROM rc_leads
			LEFT JOIN rc_leads_pl ON rc_leads.id = rc_leads_pl.id
			LEFT JOIN rc_leads_hl ON rc_leads.id = rc_leads_hl.id
			LEFT JOIN rc_leads_cl ON rc_leads.id = rc_leads_cl.id
			LEFT JOIN rc_leads_sp ON rc_leads.id = rc_leads_sp.id
			LEFT JOIN rc_users ON rc_leads.email = rc_users.email
			WHERE
			rc_leads.created_at >= $1 AND
			rc_leads.created_at < $2 AND
			broker = $3
			ORDER BY rc_leads.created_at DESC
  	`
		params = [startDate, endDate, broker]
	}

	const rows = await auroraQuery(command, params)
	const data = _.map(rows, (row) => _.omit(row, ['updated_at']))
	if (!data.length) {
		return `No records for ${broker} in between ${startDate} and ${endDate}`
	}

	return json2csv({ data })
}
