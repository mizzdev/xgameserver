'use strict';

const orders = require('./orders');

module.exports = function(serviceRegistry) {
  const api = {};

  api.orders = orders(serviceRegistry);

  return api;
};
