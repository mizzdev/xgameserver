'use strict';

exports.name = 'apns';
exports.serviceInterface = require('./api');
exports.init = function() {
  exports.serviceInterface.connect();
};
