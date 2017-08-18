'use strict';

const apn = require('apn');
const should = require('should');
const path = require('path');
const log4js = require('log4js');

const env = require('../../env');
const config = require('./config.json');

const logger = log4js.getLogger('apns');

let apnProvider, bundleId;

exports.connect =  function() {
  return Promise.resolve()
    .then(() => {
      const options = {
        cert: path.join(__dirname, config['APNS_CERT_FILEPATH']),
        key: path.join(__dirname, config['APNS_KEY_FILEPATH']),
        passphrase: env('APNS_PASSPHRASE'),
        production: config['APNS_PRODUCTION_MODE']
      };

      try {
        apnProvider = new apn.Provider(options);

        bundleId = env('APNS_BUNDLEID');
        should.exist(bundleId, 'APNS_BUNDLEID environment variable is missing');
      } catch (err) {
        switch (err.code) {
        case 'ENOENT':
          logger.error('File not found:', err.path);
          break;
        default:
          logger.error(err.message);
        }

        apnProvider = null;
      }
    });
};

exports.send = function(deviceToken, message) {
  return Promise.resolve()
    .then(() => {
      should.exist(apnProvider, 'Provider is not initialized');

      const note = new apn.Notification();
      note.alert = message;
      note.sound = 'push.caf';
      note.topic = bundleId;

      return apnProvider.send(note, deviceToken)
        .then((response) => {
          if (!response.failed.length) {
            return;
          }

          const errMsg = response.failed.map((failedRecord) => {
            if (!failedRecord.error) {
              return failedRecord;
            }

            return {
              device: failedRecord.device,
              error: failedRecord.error.message
            };
          });
          throw new Error(JSON.stringify(errMsg));
        });
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};
