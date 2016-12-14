const winston = require('winston');
const WinstonNewrelic = require('./newrelic');
const ConsoleTransport = require('./console');

const logger = new (winston.Logger)({
	transports: [
		new WinstonNewrelic({}),
		new ConsoleTransport({ level: 'info' }),
	],
});

module.exports = logger;
