'use strict';

const Promise = require('bluebird');
const PQueue = require('p-queue');
const should = require('should');

const Order = require('../models/order');
const serviceRegistry = require('../../registry');

const orderCreationQueue = new PQueue({ concurrency: 1 });

function orderCreationTask(order, limit) {
  const accountsService = serviceRegistry.getService('accounts');

  return Order.count({ ownerId: order.ownerId })
    .then((count) => {
      if (count < limit) {
        return;
      }

      should(count).be.lessThan(limit, 'Order limit exceeded');
    })
    .then(() => accountsService.removeItem(order.ownerId, order.item))
    .then(() => order.save().catch((err) => {
      return accountsService.addItem(order.ownerId, order.item).throw(err);
    }));
}

exports.getList = function(req, res, next) {
  const accountsService = serviceRegistry.getService('accounts');

  Promise.resolve()
    .then(() => {
      if (typeof req.query.ownerId === 'undefined') {
        return Order.sample({
          ownerId: { $ne: req.account.id },
          minLevel: { $lte: req.account.level }
        }, req.query.limit);
      }

      should(isNaN(req.query.ownerId)).be.false();

      const ownerId = parseFloat(req.query.ownerId);
      should(ownerId | 0).be.equal(ownerId);

      return Order.find({ ownerId: ownerId });
    })
    .then((orders) => {
      const items = orders.map((order) => order.item);

      return accountsService.getItemProperties(items)
        .then((properties) => {
          return orders.filter((order, idx) => {
            return (req.account.level >= properties[idx].minLevel);
          });
        });
    })
    .then((orders) => res.json(orders))
    .catch((err) => {
      switch (err.name) {
      case 'AssertionError':
        return res.status(400).send('Invalid Query');
      default:
        return next(err);
      }
    });
};

exports.create = function(req, res, next) {
  const order = new Order({
    ownerId: req.account.id,
    ownerNickname: req.account.nickname,
    item: req.body.item,
    cost: req.body.cost,
    currency: req.body.currency
  });

  orderCreationQueue.add(orderCreationTask.bind(null, order, req.account.orderCellsUnlocked))
    .then(() => res.json({}))
    .catch((err) => {
      const capitalize = (str) => str.replace(/\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

      switch (err.name) {
      case 'AssertionError':
        return res.status(400).send(capitalize(err.message));
      case 'ValidationError':
        return res.status(400).send('Order Validation Error');
      default:
        return next(err);
      }
    });
};
