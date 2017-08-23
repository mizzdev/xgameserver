'use strict';

const Promise = require('bluebird');
const PQueue = require('p-queue');
const should = require('should');

const Order = require('../models/order');
const serviceRegistry = require('../../registry');

const orderCreationQueue = new PQueue({ concurrency: 1 });

function orderCreationTask(order, limit) {
  const accountsService = serviceRegistry.getService('accounts');

  return Order.count()
    .then((count) => {
      if (count < limit) {
        return;
      }

      should(count).be.lessThan(limit, 'Order limit exceeded');
    })
    .then(() => accountsService.removeItem(order.ownerId, order.item))
    .then(() => order.save().catch((err) => {
      accountsService.addItem(order.ownerId, order.item).throw(err);
    }));
}

exports.sample = function(req, res, next) {
  Promise.resolve()
    .then(() => Order.sample(req.query.level, req.query.limit))
    .then((orders) => res.json(orders))
    .catch((err) => next(err));
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
      default:
        return next(err);
      }
    });
};
