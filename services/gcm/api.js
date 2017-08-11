'use strict';

const Promise = require('bluebird');
const request = require('request');
const log4js = require('log4js');
const should = require('should');

const config = require('./config.json');
const env = require('../../env');

const logger = log4js.getLogger('gcm');

exports.send = function(deviceToken, message) {
  const url = config['GCM_REQUEST_URL'];
  const key = env('GCM_KEY');
  const title = env('GCM_TITLE');

  should.exist(key, 'GCM_KEY environment variable is missing');
  should.exist(title, 'GCM_TITLE environment variable is missing');

  return Promise.promisify(request)({
    url: url,
    method: 'POST',
    headers: { 'Authorization': `key=${key}` },
    json: true,
    body: {
      data: {
        ntf_title: title,
        ntf_message: message
      },
      to: deviceToken
    }
  })
    .then((res) => {
      if (res.body.failure) {
        throw new Error(res.body.results[0].error);
      }
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};
