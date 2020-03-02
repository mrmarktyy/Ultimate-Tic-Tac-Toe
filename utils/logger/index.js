const winston = require('winston')
const ConsoleTransport = require('./console')

const logger = new (winston.Logger)({
	transports: [
		new ConsoleTransport({ level: 'info' }),
	],
})

module.exports = logger
