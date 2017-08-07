'use strict';

const apn = require('apn');
const should = require('should');
const path = require('path');
const log4js = require('log4js');

const config = require('./config.json');

const logger = log4js.getLogger('apns');

let apnProvider;

exports.connect =  function() {
  return Promise.resolve()
    .then(() => {
      const options = {
        cert: path.join(__dirname, config['APNS_CERT_FILEPATH']),
        key: path.join(__dirname, config['APNS_KEY_FILEPATH']),
        production: config['APNS_PRODUCTION_MODE']
      };

      try {
        apnProvider = new apn.Provider(options);
      } catch (err) {
        switch (err.code) {
        case 'ENOENT':
          logger.error('File not found:', err.path);
          break;
        default:
          logger.error(err);
        }
      }
    });
};

exports.send = function(deviceToken, message) {
  return Promise.resolve()
    .then(() => {
      should.exist(apnProvider, 'Provider is not initialized');

      const note = apn.Notification();
      note.alert = message;
      note.sound = 'default';

      return apnProvider.send(note, deviceToken);
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};
