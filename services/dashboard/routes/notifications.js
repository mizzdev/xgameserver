'use strict';

const express = require('express');
const router = express.Router();

const notificationsController = require('../controllers/notifications');

router.get('/', notificationsController.overview);
router.get('/:accountId', notificationsController.getInbox);
router.post('/:accountId', notificationsController.send);

module.exports = router;
