'use string';

const Promise = require('bluebird');
const log4js = require('log4js');

const logger = log4js.getLogger('auth');

logger.level = 'debug';

const api = {};

api.verify = function(headers) {
  return Promise.resolve()
    .then(() => logger.info(headers));
};

exports.name = 'auth';
exports.serviceInterface = api;
