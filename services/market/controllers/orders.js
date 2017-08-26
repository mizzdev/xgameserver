'use strict';

const Promise = require('bluebird');
const PQueue = require('p-queue');
const should = require('should');
const moment = require('moment');

const Order = require('../models/order');
const serviceRegistry = require('../../registry');

const orderCreationQueue = new PQueue({ concurrency: 1 });
const orderFulfillmentQueue = new PQueue({ concurrency: 1 });

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

function orderFulfillmentTask(orderId, buyer) {
  const accountsService = serviceRegistry.getService('accounts');
  const notificationsService = serviceRegistry.getService('notifications');

  let order;
  let incCurrency = '';

  return Order.findOne({ id: orderId })
    .then((result) => {
      order = result;

      if (!order) {
        return order;
      }

      switch(order.currency) {
      case 'gold':
        incCurrency = 'Gold';
        break;
      case 'gems':
        incCurrency = 'Gems';
        break;
      }

      return Promise.resolve()
        .then(() => accountsService['sub' + incCurrency].call(null, buyer.id, order.cost))
        .then(() => accountsService.addItem(buyer.id, order.item))
        .then(() => {
          const notification = {
            accountId: order.ownerId,
            title: `${buyer.nickname} #sold #ITEM_${order.item.itemId}`,
            content: `#soldBodyStart #ITEM_${order.item.itemId} #soldBodyEnd`,
            cargo: {}
          };
          notification.cargo[order.currency] = order.cost;

          return Order.remove({ id: order.id })
            .then(() => notificationsService.send(notification))
            .return(order)
            .catch((err) => {
              return Promise.resolve()
                .then(() => accountsService.removeItem(buyer.id, order.item))
                .then(() => accountsService['add' + incCurrency].call(null, buyer.id, order.cost))
                .throw(err);
            });
        });
    });
}

exports.getList = function(req, res, next) {
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

      return Order.find({
        ownerId: ownerId,
        minLevel: { $lte: req.account.level }
      });
    })
    .then((orders) => res.json(orders.map((order) => {
      order = order.toObject();

      order.time = moment.utc(order.createdAt).format('HH:mm:ss');

      delete order._id;
      delete order.__v;
      delete order.createdAt;
      delete order.updatedAt;
      delete order.random;
      delete order.minLevel;

      delete order.item._id;

      return order;
    })))
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

exports.fulfill = function(req, res, next) {
  orderFulfillmentQueue.add(orderFulfillmentTask.bind(null, req.params.orderId, req.account))
    .then((order) => {
      if (!order) {
        return res.status(404).send('Order Not Found');
      }

      return res.json({});
    })
    .catch((err) => {
      const capitalize = (str) => str.replace(/\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

      switch (err.name) {
      case 'AssertionError':
        return res.status(400).send(capitalize(err.message));
      case 'ValidationError':
        return res.status(400).send('Order Fulfillment Validation Error');
      default:
        return next(err);
      }
    });
};

