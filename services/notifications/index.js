'use strict';

const express = require('express');
const router = express.Router();

const notificationController = require('./controllers/notifications');

const checkAuth = require('./middlewares/checkAuth');
const checkIdentity = require('./middlewares/checkIdentity');

router.use(checkAuth, checkIdentity);
router.get('/:accountId', notificationController.getInbox);

exports.name = 'notifications';
exports.router = router;
exports.serviceInterface = require('./api');
