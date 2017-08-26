'use strict';

const apn = require('apn');
const should = require('should');
const path = require('path');
const log4js = require('log4js');

const env = require('../../../env');
const config = require('../config.json');

const logger = log4js.getLogger('apns');

module.exports = function(serviceRegistry, state) {
  return function connect() {
    return Promise.resolve()
      .then(() => {
        const options = {
          cert: path.join(__dirname, '..', config['APNS_CERT_FILEPATH']),
          key: path.join(__dirname, '..', config['APNS_KEY_FILEPATH']),
          passphrase: env('APNS_PASSPHRASE'),
          production: config['APNS_PRODUCTION_MODE']
        };

        try {
          state.apnProvider = new apn.Provider(options);
          state.bundleId = env('APNS_BUNDLEID');

          should.exist(state.bundleId, 'APNS_BUNDLEID environment variable is missing');
        } catch (err) {
          switch (err.code) {
          case 'ENOENT':
            logger.error('File not found:', err.path);
            break;
          default:
            logger.error(err.message);
          }
        }
      });
  };
};
