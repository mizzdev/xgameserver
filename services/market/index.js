'use strict';

const express = require('express');
const router = express.Router();

const config = require('./config.json');
const env = require('../../env');

const orderExpirationProcedure = require('./procedures/order-expiration');

const ordersController = require('./controllers/orders');

const checkAuth = require('./middlewares/check-auth');
const findAccount = require('./middlewares/find-account');

router.use(checkAuth, findAccount);

router.get('/orders', ordersController.getList);
router.post('/orders', ordersController.create);
router.delete('/orders/:orderId', ordersController.fulfill);

exports.name = 'market';
exports.router = router;
exports.serviceInterface = require('./api');

const checkPeriod = env('MARKET_ORDER_CHECK_PERIOD_MS') || config['MARKET_ORDER_CHECK_PERIOD_MS'];
exports.init = function() {
  setInterval(orderExpirationProcedure, checkPeriod);
};
