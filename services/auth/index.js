'use string';

const crypto = require('crypto');
const Promise = require('bluebird');
const log4js = require('log4js');
const config = require('./config');

const logger = log4js.getLogger('auth');

logger.level = 'debug';

function parseAuthHeader(authorization) {
  const splitHeader = authorization.split(' ');

  if (splitHeader.length !== 2) {
    throw new Error('Cannot parse Authorization header');
  }

  const scheme = splitHeader[0];
  const params = splitHeader[1];

  const splitParams = params.split('.');

  if (splitParams.length !== 2) {
    throw new Error('Cannot parse Authorization header params');
  }

  let payload;

  try {
    payload = JSON.parse(new Buffer(splitParams[0], 'base64').toString('utf8'));
  } catch (err) {
    throw new Error(`Cannot parse Authorization header payload: ${err.message}`);
  }

  return { scheme, payload, signature: splitParams[1] };
}

function checkSignature(payload, signature) {
  return api.getKeyById(payload.id)
    .then((key) => {
      const hash = crypto.createHash('sha1');

      hash.update(`${payload.id}${key}${payload.time}`);
      return new Buffer(hash.digest('hex')).toString('base64');
    })
    .then((digest) => {
      if (signature != digest) {
        throw new Error('Invalid signature');
      }
    });
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

      return checkSignature(authData.payload, authData.signature);
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
