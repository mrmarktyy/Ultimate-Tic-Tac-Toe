var keystone = require('keystone');

var Company = keystone.list('Company');
var PersonalLoan = keystone.list('PersonalLoan');
var CreditCard = keystone.list('CreditCard');

exports.list = function (req, res) {

	let promise = Company.model.find().lean().exec();

	let response = {};
	let countPromises = [];
	promise.then(function (companies) {
		companies.forEach(function (company) {

			response[company._id] = Object.assign(company, { verticals: {} });

			let plPromise = PersonalLoan.model.count({
				company: company._id,
				isPersonalLoan: 'YES',
			}).exec(function (err, count) {
				if (err) return 'database error';
				response[company._id].verticals.personalLoans = count;
			});
			countPromises.push(plPromise);

			let clPromise = PersonalLoan.model.count({
				company: company._id,
				isCarLoan: 'YES',
			}).exec(function (err, count) {
				if (err) return 'database error';
				response[company._id].verticals.carLoans = count;
			});
			countPromises.push(clPromise);

			let ccPromise = CreditCard.model.count({
				company: company._id,
			}).exec(function (err, count) {
				if (err) return 'database error';
				response[company._id].verticals.creditCards = count;
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
