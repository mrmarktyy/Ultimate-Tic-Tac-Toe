const _ = require('lodash')
const keystone = require('keystone')
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
	const data = _.map(rows, (row) => {
		const data = _.omit(row, ['updated_at'])
		data.productUUID = _.get(row, 'product.uuid', '')
		data.productName = _.get(row, 'product.name', '')
		return data
	})
	if (!data.length) {
		return `No records for ${broker} in between ${startDate} and ${endDate}`
	}

	return json2csv({ data })
}

const findProduct = async (uuid) => {
	const model = await keystone.list('PersonalLoan').model
	const clause = { isPersonalLoan: 'YES', uuid }
	return await model.findOne(clause).populate('company').lean().exec() || {}
}

exports.marketplaceCsv = async (startDate, endDate) => {
	const params = [startDate, endDate]
	const command = `
		SELECT u.first_name, u.last_name, l.email, product->>'applied' AS products FROM rc_leads AS l
		LEFT JOIN rc_users AS u ON l.email = u.email
		WHERE
		l.created_at >= $1 AND
		l.created_at < $2 AND
		l.product->>'applied' IS NOT NULL
		ORDER BY l.created_at DESC;
	`
	const rows = await auroraQuery(command, params)
	if (!rows.length) {
		return `No marketplace leads found in between ${startDate} and ${endDate}`
	}
	const uuid = new Set()
	rows.forEach((row) => {
		row.products = JSON.parse(row.products)
		Object.keys(row.products).forEach((id) => uuid.add(id))
	})
	const lenders = {}
	await Promise.all(
		Array.from(uuid).map(async (id) => {
			const product = await findProduct(id)
			lenders[id] = product.company.slug
		})
	)
	const data = rows.map((row) => {
		row.broker = Object.keys(row.products).map((id) => lenders[id]).join(',')
		delete row.products
		return row
	})

	return json2csv({ data })
}
