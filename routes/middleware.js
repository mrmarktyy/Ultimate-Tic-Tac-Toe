var _ = require('lodash')

/**
	Initialises the standard view locals
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Import Rates', key: 'importRates', href: '/import-rates' },
		{ label: 'Monthly Clicks', key: 'monthlyClicks', href: '/monthly-clicks-export' },
		{ label: 'Salesforce Push', key: 'salesforcePush', href: '/salesforce-push' },
		{ label: 'Import ECPC', key: 'importEcpc', href: '/import-ecpc' },
		{ label: 'Export Leads', key: 'exportLeads', href: '/monthly-leads-export' },
	]
	res.locals.user = req.user
	next()
}

/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	}
	res.locals.messages = _.some(flashMessages, (msgs) => { return msgs.length }) ? flashMessages : false
	next()
}

/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.')
		res.redirect('/keystone/signin')
	} else {
		next()
	}
}

exports.financeUser = function (req, res, next) {
	const KEY_PEOPLE = ['ian.fletcher@ratecity.com.au', 'rochelle.dicristo@ratecity.com.au', 'pravin.mahajan@ratecity.com.au', 'matthew.halpin@ratecity.com.au']
	if (KEY_PEOPLE.includes(req.user.email) === false) {
		req.flash('error', 'Only key people have access to this page.')
		res.redirect('/')
	} else {
		next()
	}
}
