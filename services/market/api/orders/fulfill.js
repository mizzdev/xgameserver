'use strict';

const PQueue = require('p-queue');

const Order = require('../../models/order');

const orderFulfillmentQueue = new PQueue({ concurrency: 1 });

module.exports = function(serviceRegistry) {
  function orderFulfillmentTask(orderId, buyerId, buyerNickname) {
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
          .then(() => accountsService['sub' + incCurrency].call(null, buyerId, order.cost))
          .then(() => accountsService.addItem(buyerId, order.item))
          .then(() => {
            const notification = {
              accountId: order.ownerId,
              title: `${buyerNickname} #sold #ITEM_${order.item.itemId}`,
              content: `#soldBodyStart #ITEM_${order.item.itemId} #soldBodyEnd`,
              cargo: {}
            };
            notification.cargo[order.currency] = order.cost;

            return Order.remove({ id: order.id })
              .then(() => notificationsService.send(notification))
              .return(order)
              .catch((err) => {
                return Promise.resolve()
                  .then(() => accountsService.removeItem(buyerId, order.item))
                  .then(() => accountsService['add' + incCurrency].call(null, buyerId, order.cost))
                  .throw(err);
              });
          });
      });
  }

  return function(orderId, buyerId, buyerNickname) {
    return orderFulfillmentQueue.add(orderFulfillmentTask.bind(null, orderId, buyerId, buyerNickname));
  };
};
