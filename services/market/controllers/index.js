'use strict';

const orders = require('./orders');

module.exports = function(api) {
  const controllers =  {};

  controllers.orders = orders(api);

  return controllers;
};
