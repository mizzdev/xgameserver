'use strict';

const PQueue = require('p-queue');
const should = require('should');

const Order = require('../../models/order');

const orderCreationQueue = new PQueue({ concurrency: 1 });

module.exports = function(serviceRegistry) {
  function orderCreationTask(order, limit) {
    const accountsService = serviceRegistry.getService('accounts');

    return Order.count({ ownerId: order.ownerId })
      .then((count) => {
        if (count < limit) {
          return;
        }

        should(count).be.lessThan(limit, 'Order limit exceeded');
      })
      .then(() => {
        return accountsService.getItemProperties(order.item)
          .then((properties) => order.minLevel = properties.minLevel);
      })
      .then(() => accountsService.removeItem(order.ownerId, order.item))
      .then(() => order.save().catch((err) => {
        return accountsService.addItem(order.ownerId, order.item).throw(err);
      }));
  }

  return function(order, limit) {
    return orderCreationQueue.add(orderCreationTask.bind(null, new Order(order), limit));
  };
};
