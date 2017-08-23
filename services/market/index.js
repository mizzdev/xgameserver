'use strict';

const express = require('express');
const router = express.Router();

const ordersController = require('./controllers/orders');

const checkAuth = require('./middlewares/check-auth');
const findAccount = require('./middlewares/find-account');

router.use(checkAuth, findAccount);

router.get('/orders', ordersController.getList);
router.post('/orders', ordersController.create);

exports.name = 'market';
exports.router = router;
exports.serviceInterface = require('./api');
