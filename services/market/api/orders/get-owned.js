'use strict';

const Order = require('../../models/order');

module.exports = function() {
  return function(ownerId, refLevel) {
    return Order.find({
      ownerId: ownerId,
      minLevel: { $lte: refLevel }
    });
  };
};
