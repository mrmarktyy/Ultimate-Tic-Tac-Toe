var async = require('async');
var keystone = require('keystone');

var Company = keystone.list('Company');

exports.list = function(req, res) {
  Company.model.find().exec(function(err, items) {
    if (err) return res.apiError('database error', err);
    res.jsonp(items);
  });
}
