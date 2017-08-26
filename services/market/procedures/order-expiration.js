'use strict';

const Promise = require('bluebird');
const log4js = require('log4js');
const Order = require('../models/order');

const config = require('../config.json');
const serviceRegistry = require('../../registry');
const env = require('../../../env');

const logger = log4js.getLogger('market');

const expiresIn = env('MARKET_ORDER_EXPIRES_IN_MS') || config['MARKET_ORDER_EXPIRES_IN_MS'];
const concurrency = env('MARKET_ORDER_CHECK_CONCURRENCY') || config['MARKET_ORDER_CHECK_CONCURRENCY'];

function checkOldestOrders() {
  const query = {};
  query.createdAt = {
    $lt: (new Date()) - expiresIn
  };

  return Order.find(query)
    .sort('createdAt')
    .limit(concurrency)
    .then((orders) => {
      if (!orders.length) {
        return;
      }

      const notificationsService = serviceRegistry.getService('notifications');

      return Promise.map(orders, (order) => {
        return Order.findOneAndRemove({ id: order.id })
          .then((removed) => {
            if (!removed) {
              logger.warn(
                `Order ID ${order.id} has been already expired at the consequent check procedure`,
                'Perhaps you may consider either lowering MARKET_ORDER_CHECK_CONCURRENCY',
                'or raising MARKET_ORDER_CHECK_PERIOD_MS'
              );
              return;
            }

            const notification = {
              accountId: order.ownerId,
              title: `#ITEM_${order.item.itemId} #expired`,
              content: '#expiredBody',
              cargo: { items: [order.item] }
            };

            logger.debug(`Order ID ${order.id} has just been expired`);

            return notificationsService.send(notification);
          });
      }).then(checkOldestOrders);
    });
}

module.exports = checkOldestOrders;
