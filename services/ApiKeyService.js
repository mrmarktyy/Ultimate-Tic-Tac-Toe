var keystone = require('keystone');

var ApiKey = keystone.list('ApiKey');

exports.isApiKeyValid = function (apiKey) {
  return ApiKey.model.findOne({'apiKey': apiKey}).exec(function (err, apiKey) {
      if (err) {
        console.log('database error')
        return null
      } else {
        return apiKey
      }
    }
  );
}
