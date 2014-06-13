/*global sails*/
'use strict';

var Logger = sails.log;

var LEVELS = {
    VERBOSE: 'verbose',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERR: 'error'
};

var level = LEVELS.INFO;

function getLevel() {
    return level;
}

function setLevel(level) {
    level = LEVELS[level] || LEVELS.INFO;
}

function log(message) {
    Logger[level](message);
}

function verbose(message) {
    Logger.verbose(message);
}

function info(message) {
    Logger.info(message);
}

function warn(message) {
    Logger.warn(message);
}

function debug(message) {
    Logger.debug(message);
}

function error(message) {
    Logger.error(message);
}

module.exports = {
    getLevel    : getLevel,
    setLevel    : setLevel,
    verbose     : verbose,
    log         : log,
    info        : info,
    warn        : warn,
    debug       : debug,
    error       : error
};
