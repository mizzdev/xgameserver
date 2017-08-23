'use strict';

const express = require('express');
const router = express.Router();

const ordersController = require('./controllers/orders');

const checkAuth = require('./middlewares/check-auth');
const findAccount = require('./middlewares/find-account');

router.use(checkAuth);

router.get('/orders', ordersController.sample);
router.post('/orders', findAccount, ordersController.create);

exports.name = 'market';
exports.router = router;
exports.serviceInterface = require('./api');
