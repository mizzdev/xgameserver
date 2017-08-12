'use strict';

const express = require('express');
const router = express.Router();

const notificationsController = require('./controllers/notifications');
const tokenStoragesController = require('./controllers/token-storages');

const checkAuth = require('./middlewares/checkAuth');
const checkIdentity = require('./middlewares/checkIdentity');
const findTokenStorage = require('./middlewares/find-token-storage');

router.use(checkAuth, checkIdentity);

router.get('/:accountId/device-tokens-ios', findTokenStorage, tokenStoragesController.getIOSTokenList);
router.post('/:accountId/device-tokens-ios', findTokenStorage, tokenStoragesController.createIOSToken);
router.get('/:accountId/device-tokens-android', findTokenStorage, tokenStoragesController.getAndroidTokenList);
router.post('/:accountId/device-tokens-android', findTokenStorage, tokenStoragesController.createAndroidToken);

router.get('/:accountId', notificationsController.getInbox);

exports.name = 'notifications';
exports.router = router;
exports.serviceInterface = require('./api');
