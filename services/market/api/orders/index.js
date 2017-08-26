'use strict';

const create = require('./create');
const fulfill = require('./fulfill');
const getRandom = require('./get-random');
const getOwned = require('./get-owned');

module.exports = function(serviceRegistry) {
  const ordersApi = {};

  ordersApi.create = create(serviceRegistry);
  ordersApi.fulfill = fulfill(serviceRegistry);
  ordersApi.getRandom = getRandom(serviceRegistry);
  ordersApi.getOwned = getOwned(serviceRegistry);

  return ordersApi;
};
