var keystone = require('keystone');

var Company = keystone.list('Company');
var PersonalLoan = keystone.list('PersonalLoan');
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan');
var CreditCard = keystone.list('CreditCard');

exports.list = function (req, res) {

	let promise = Company.model.find().lean().exec();

	let response = {};
	let countPromises = [];
	promise.then(function (companies) {
		companies.forEach(function (company) {

			response[company._id] = Object.assign(company, {
				verticals: {
					personalLoans: {},
					carLoans: {},
					creditCards: {},
				},
			});

			let plPromise = PersonalLoan.model.count({
				company: company._id,
				isPersonalLoan: 'YES',
			}).exec(function (err, count) {
				if (err) return 'database error';
				response[company._id].verticals.personalLoans.count = count;
			});
			countPromises.push(plPromise);

			let clPromise = PersonalLoan.model.count({
				company: company._id,
				isCarLoan: 'YES',
			}).exec(function (err, count) {
				if (err) return 'database error';
				response[company._id].verticals.carLoans.count = count;
			});
			countPromises.push(clPromise);

			let plbPromise = CompanyPersonalLoan.model.find({
				company: company._id,
			}).lean().exec(function (err, cp) {
				if (err) return 'database error';
				if (cp.length > 0) {
					response[company._id].verticals.personalLoans.blurb = cp[0].personalLoanBlurb || '';
					response[company._id].verticals.carLoans.blurb = cp[0].carLoanBlurb || '';
				}
			});
			countPromises.push(plbPromise);

			let ccPromise = CreditCard.model.count({
				company: company._id,
			}).exec(function (err, count) {
				if (err) return 'database error';
				response[company._id].verticals.creditCards.count = count;
			});
			countPromises.push(ccPromise);

		});

		Promise.all(countPromises).then(() => {
			let result = [];
			for (let key in response) {
				result.push(response[key]);
			}
			res.jsonp(result);
		});
	});

};
