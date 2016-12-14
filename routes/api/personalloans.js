var keystone = require('keystone');
var availableOptions = require('../../models/attributes/availableOptions');
var mongoose = require('mongoose');

var PersonalLoan = keystone.list('PersonalLoan');
var PersonalLoanVariation = keystone.list('PersonalLoanVariation');
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan');
var Monetize = mongoose.model('Monetize');


exports.list = function (req, res) {

	let promise = PersonalLoan.model.find().populate('company').lean().exec();

	let response = {};
	let variationPromises = [];
	promise.then(function (personalLoans) {
		personalLoans.forEach(function (personalLoan) {
			if (personalLoan.existsOnSorbet && personalLoan.isPersonalLoan === availableOptions.yes) {

				let promise = PersonalLoanVariation.model.find({ product: personalLoan._id }).lean().exec(function (err, variations) {
					if (err) return 'database error';
					let variationObjects = variations.map(function (v) {
						return handleComparisonRate(v);
					});
					response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], { variations: variationObjects });
				});
				variationPromises.push(promise);

				let plcPromise = CompanyPersonalLoan.model.find({ company: personalLoan.company._id }).lean().exec(function (err, plc) {
					if (err) return 'database error';
					response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], { companyVertical: plc });
				});
				variationPromises.push(plcPromise);

				let mntzPromise = Monetize.findOne({ product: personalLoan._id }).lean().exec(function (err, monetize) {
					if (err) return 'database error';
					let applyUrl = null;
					let enabled = false;
					if (monetize !== null) {
						applyUrl = monetize.applyUrl;
						enabled = monetize.enabled;
					}
					response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], { gotoSiteUrl: applyUrl, gotoSiteEnabled: enabled });
				});
				variationPromises.push(mntzPromise);
			}
		});

		Promise.all(variationPromises).then(() => {
			let result = [];
			for (let key in response) {
				result.push(response[key]);
			}
			res.jsonp(result);
		});
	});
};

exports.one = function (req, res) {

	let id = req.params.id;
	let promise = PersonalLoan.model.findById(id).populate('company').lean().exec();

	promise.then(function (personalLoan) {
		if (personalLoan == null) {
			res.jsonp('{error: id not found }');
			return;
		}
		PersonalLoanVariation.model.find({ product: personalLoan._id }).lean().exec(function (err, variation) {
			if (err) return 'database error';
			personalLoan.variations = variation;
			res.jsonp(personalLoan);
		});
	}).catch(function (e) {
		console.log(e);
		res.jsonp('{error:error}');
	});
};

function handleComparisonRate (variation) {
	if (variation.comparisonRatePersonalManual) {
		variation.personalLoanComparisonRate = variation.comparisonRatePersonalManual;
	} else {
		variation.personalLoanComparisonRate = variation.comparisonRatePersonal;
	}

	if (variation.comparisonRateCarManual) {
		variation.carLoanComparisonRate = variation.comparisonRateCarManual;
	} else {
		variation.carLoanComparisonRate = variation.comparisonRateCar;
	}

	return variation;
}
