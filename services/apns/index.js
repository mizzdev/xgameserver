'use strict';

const api = require('./api');

module.exports = function(serviceRegistry) {
  const service = {};

  service.name = 'apns';
  service.serviceInterface = api(serviceRegistry);

  service.serviceInterface.connect();

  return service;
};
