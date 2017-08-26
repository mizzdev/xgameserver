'use strict';

const Promise = require('bluebird');
const should = require('should');
const moment = require('moment');

module.exports = function(api) {
  return function(req, res, next) {
    Promise.resolve()
      .then(() => {
        if (typeof req.query.ownerId === 'undefined') {
          return api.orders.getRandom(req.account.id, req.account.level, req.query.limit);
        }

        should(isNaN(req.query.ownerId)).be.false();

        const ownerId = parseFloat(req.query.ownerId);
        should(ownerId | 0).be.equal(ownerId);

        return api.orders.getOwned(ownerId, req.account.level);
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
};
