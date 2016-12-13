require('dotenv').config();
const winston = require('winston');
const util = require('util');

let WinstonNewrelic = module.exports = function (options) {
	this.name = 'winston-newrelic';
	this.level = options.level || 'error';
	this.newrelic = options.newrelic || require('newrelic');
};

util.inherits(WinstonNewrelic, winston.Transport);
winston.transports.newrelic = WinstonNewrelic;

WinstonNewrelic.prototype.log = function (level, message, meta, callback) {
	let error;
	if (meta && meta.stack) {
		error = { message: meta.message || message, stack: meta.stack };
	} else {
		error = message;
	}

	this.newrelic.noticeError(error, meta);
	callback(null, true);
};
