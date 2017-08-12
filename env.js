'use strict';

const log4js = require('log4js');
const defaults = require('./defaults.json');

const logger = log4js.getLogger('Environment Manager');

const nodeEnv = process.env.NODE_ENV || 'dev';

let config = {};
try {
  config = require(`./${nodeEnv}.conf.json`);
  logger.debug(`Running under "${nodeEnv}" environment`);
} catch (err) {
  logger.warn(`Unable to load configuration file for "${nodeEnv}" environment:`, err.message);
  logger.warn('The system is forced to run under defaults');
  logger.warn('Please, provide a proper configuration file ASAP');
  logger.warn('IMPORTANT! DO NOT EVER MODIFY defaults.json FILE, AS THIS MAY LEAD TO UNPLANNED SENSETIVE DATA LEAKAGE');
}

module.exports = function(variableName) {
  return process.env[variableName] || config[variableName] || defaults[variableName];
};
