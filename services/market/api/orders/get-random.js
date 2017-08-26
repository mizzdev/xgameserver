'use strict';

const Order = require('../../models/order');

module.exports = function() {
  return function(refId, refLevel, limit) {
    return Order.sample({
      ownerId: { $ne: refId },
      minLevel: { $lte: refLevel }
    }, limit);
  };
};
