'use strict';

const apn = require('apn');
const should = require('should');
const log4js = require('log4js');

const logger = log4js.getLogger('apns');

module.exports = function(serviceRegistry, state) {
  exports.send = function(deviceToken, message) {
    return Promise.resolve()
      .then(() => {
        should.exist(state.apnProvider, 'Provider is not initialized');

        const note = new apn.Notification();

        note.alert = message;
        note.sound = 'push.caf';
        note.topic = state.bundleId;

        return state.apnProvider.send(note, deviceToken)
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
};
