'use strict';

const express = require('express');
const router = express.Router();

const notificationsController = require('./controllers/notifications');
const tokenStoragesController = require('./controllers/token-storages');

const checkAuth = require('./middlewares/checkAuth');
const checkIdentity = require('./middlewares/checkIdentity');
const findTokenStorage = require('./middlewares/find-token-storage');

router.use(checkAuth, checkIdentity);

router.get('/:accountId', notificationsController.getInbox);

router.use('/:accountId', findTokenStorage);

router.get('/:accountId/lang', tokenStoragesController.getLanguage);
router.post('/:accountId/lang', tokenStoragesController.setLanguage);

router.get('/:accountId/device-tokens-ios', tokenStoragesController.getIOSTokenList);
router.post('/:accountId/device-tokens-ios', tokenStoragesController.createIOSToken);
router.get('/:accountId/device-tokens-android', tokenStoragesController.getAndroidTokenList);
router.post('/:accountId/device-tokens-android', tokenStoragesController.createAndroidToken);

exports.name = 'notifications';
exports.router = router;
exports.serviceInterface = require('./api');
