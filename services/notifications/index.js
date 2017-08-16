'use strict';

const express = require('express');
const router = express.Router();

const notificationsController = require('./controllers/notifications');
const tokenStoragesController = require('./controllers/token-storages');

const checkAuth = require('./middlewares/check-auth');
const checkIdentity = require('./middlewares/check-identity');
const findTokenStorage = require('./middlewares/find-token-storage');

router.use(checkAuth, checkIdentity);

router.get('/:accountId/notifications', notificationsController.getInbox);
router.post('/:accountId/notifications/:notificationId', notificationsController.markAsSeen);

router.use('/:accountId', findTokenStorage);

router.get('/:accountId/lang', tokenStoragesController.getLanguage);
router.post('/:accountId/lang', tokenStoragesController.setLanguage);

router.get('/:accountId/device-tokens-ios', tokenStoragesController.getIOSTokenList);
router.post('/:accountId/device-tokens-ios', tokenStoragesController.addIOSToken);
router.get('/:accountId/device-tokens-android', tokenStoragesController.getAndroidTokenList);
router.post('/:accountId/device-tokens-android', tokenStoragesController.addAndroidToken);

exports.name = 'notifications';
exports.router = router;
exports.serviceInterface = require('./api');
