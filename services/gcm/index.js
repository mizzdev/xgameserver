'use strict';

const api = require('./api');

module.exports = function(serviceRegistry) {
  const service = {};

  service.name = 'gcm';
  service.serviceInterface = api(serviceRegistry);

  return service;
};
