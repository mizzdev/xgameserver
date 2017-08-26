'use strict';

const create = require('./create');
const fulfill = require('./fulfill');
const getList = require('./get-list');

module.exports = function(api) {
  const ordersController = {};

  ordersController.create = create(api);
  ordersController.fulfill = fulfill(api);
  ordersController.getList = getList(api);

  return ordersController;
};
