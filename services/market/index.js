'use strict';

const express = require('express');

const config = require('./config.json');
const env = require('../../env');

const api = require('./api');
const controllers = require('./controllers');
const middlewares = require('./middlewares');
const orderExpirationProcedure = require('./procedures/order-expiration');

module.exports = function(serviceRegistry) {
  const router = express.Router();

  const service = {};

  service.name = 'market';
  service.router = router;
  service.serviceInterface = api(serviceRegistry);

  const serviceMiddlewares = middlewares(serviceRegistry);
  const serviceControllers = controllers(service.serviceInterface);

  const ordersController = serviceControllers.orders;

  router.use(serviceMiddlewares.checkAuth, serviceMiddlewares.findAccount);

  router.get('/orders', ordersController.getList);
  router.post('/orders', ordersController.create);
  router.delete('/orders/:orderId', ordersController.fulfill);

  const checkPeriod = env('MARKET_ORDER_CHECK_PERIOD_MS') || config['MARKET_ORDER_CHECK_PERIOD_MS'];
  setInterval(orderExpirationProcedure(serviceRegistry), checkPeriod);

  return service;
};
