'use string';

const crypto = require('crypto');
const Promise = require('bluebird');
const log4js = require('log4js');
const config = require('./config');

const logger = log4js.getLogger('auth');

logger.level = 'debug';

function parseAuthHeader(authorization) {
  const splitString = authorization.split(' ');

  if (splitString.length !== 2) {
    throw new Error('Cannot parse Authorization header');
  }

  return { scheme: splitString[0], signature: splitString[1] };
}

const api = {};

api.verify = function(headers) {
  return Promise.resolve()
    .then(() => {
      if (!headers.authorization || !headers.authorization.length) {
        throw new Error('Missing Authorization header');
      }

      const authData = parseAuthHeader(headers.authorization);
      logger.debug(authData);

      if (authData.scheme !== config['AUTH_SCHEME']) {
        throw new Error('Invalid authorization scheme');
      }
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};

api.getKeyById = function(accountId) {
  return Promise.resolve()
    .then(() => {
      const hash = crypto.createHash('sha1');

      hash.update(`${accountId}{config["APP_SECRET"]}`);
      return new Buffer(hash.digest('hex')).toString('base64');
    });
};

exports.name = 'auth';
exports.serviceInterface = api;
