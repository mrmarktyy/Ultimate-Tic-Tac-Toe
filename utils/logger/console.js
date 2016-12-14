const winston = require('winston');
const PrettyError = require('pretty-error');

class ConsoleTransport extends winston.Transport {
	constructor (options) {
		super(options);
		this.name = 'winston-ultimate-console';
		this.level = options.level || 'info';
		this.prettyError = new PrettyError();
		this.prettyError.skipNodeFiles();
		this.prettyError.skipPackage('express');
	}
	timestamp () {
		return new Date();
	}
	log (level, message, meta, callback) {
		if (level === 'error') {
			console.log(this.timestamp());
			console.log(this.prettyError.render(meta));
		} else {
			const str = this.timestamp()
				+ ' '
				+ level.toUpperCase()
				+ ' '
				+ (undefined !== message ? message : '')
				+ (meta && Object.keys(meta).length ? '\n\t' + JSON.stringify(meta) : '');
			console.log(str);
		}
		callback(null, true);
	}
}

module.exports = ConsoleTransport;
