var keystone = require('keystone');

var ApiKey = keystone.list('ApiKey');
var logger = require('../utils/logger');

exports.isApiKeyValid = function (apiKey) {
	return ApiKey.model.findOne({ apiKey: apiKey }).exec(function (err, apiKey) {
		if (err) {
			logger.error('database error when access api key');
			return null;
		} else {
			logger.info('user with api key id', apiKey._id, ' and api key ', apiKey.apiKey, ' verified');
			return apiKey;
		}
	}
  );
};
