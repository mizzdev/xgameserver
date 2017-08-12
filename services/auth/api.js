'use strict';

const crypto = require('crypto');
const Promise = require('bluebird');
const should = require('should/as-function');
const log4js = require('log4js');

const AuthNonce = require('./models/auth-nonce');
const BanlistRecord = require('./models/banlist-record');

const env = require('../../env');

const logger = log4js.getLogger('auth');

logger.level = 'error';

function parseAuthHeader(authorization) {
  const splitHeader = authorization.split(' ');
  should(splitHeader).have.length(2, 'Cannot parse Authorization header');

  const scheme = splitHeader[0];
  const params = splitHeader[1];

  const splitParams = params.split('.');
  should(splitParams).have.length(2, 'Cannot parse Authorization header params');

  let payload;
  payload = JSON.parse(new Buffer(splitParams[0], 'base64').toString('utf8'));

  return { scheme, payload, signature: splitParams[1] };
}

function checkSignature(payload, signature) {
  return exports.getKeyById(payload.id)
    .then((key) => {
      const hash = crypto.createHash('sha1');

      hash.update(`${payload.id}${key}${payload.time}`);
      return new Buffer(hash.digest('hex')).toString('base64');
    })
    .then((digest) => should(signature).be.equal(digest, 'Invalid signature'));
}

function checkNonce(payload) {
  return AuthNonce.findOne({ id: payload.id, nonce: payload.time })
    .then((authNonce) => {
      should.not.exist(authNonce, 'Such Authorization payload has been already used');
      return new AuthNonce({ id: payload.id, nonce: payload.time }).save();
    });
}

exports.verify = function(headers) {
  return Promise.resolve()
    .then(() => {
      should(headers).have.property('authorization');
      should(headers.authorization).not.be.empty();

      const authData = parseAuthHeader(headers.authorization);
      logger.debug(authData);

      should(authData.scheme).be.equal(env('AUTH_SCHEME'), 'Invalid authorization scheme');
      should(authData.payload).have.property('id');
      should(authData.payload).have.property('time');

      if (env('AUTH_IGNORE_SIGNATURE')) {
        return Number(authData.payload.id);
      }

      return Promise.resolve()
        .then(() => checkNonce(authData.payload))
        .then(() => checkSignature(authData.payload, authData.signature))
        .then(() => Number(authData.payload.id));
    })
    .then((accountId) => {
      return BanlistRecord.isBanned(accountId)
        .then((banned) => {
          should(banned).be.false('Banned');
          return accountId;
        });
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};

exports.getKeyById = function(accountId) {
  return Promise.resolve()
    .then(() => {
      const hash = crypto.createHash('sha1');

      hash.update(`${accountId}${env('AUTH_APP_SECRET')}`);
      return new Buffer(hash.digest('hex')).toString('base64');
    });
};

exports.getBanlist = function() {
  return BanlistRecord.find();
};

exports.ban = function(accountId, durationSeconds) {
  return BanlistRecord.ban(accountId, durationSeconds);
};

exports.unban = function(accountId) {
  return BanlistRecord.unban(accountId);
};

exports.isBanned = function(accountId) {
  return BanlistRecord.isBanned(accountId);
};
