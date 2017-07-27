'use strict';

const Promise = require('bluebird');
const log4js = require('log4js');
const mongoose = require('mongoose');

const logger = log4js.getLogger('db');
logger.level = 'debug';

exports.init = function(mongoUrl) {
  mongoose.Promise = Promise;
  mongoose.connect(mongoUrl, {
    server: {
      socketOptions: {
        socketTimeoutMS: 0,
        connectTimeoutMS: 0
      }
    }
  })
    .then(() => logger.info('MONGODB:', 'Connected!'))
    .catch((err) => logger.error('MONGODB:', err.message));
};
