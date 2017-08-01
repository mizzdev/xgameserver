'use strict';

const express = require('express');
const router = express.Router();

const roomsController = require('./controllers/rooms');
const messagesController = require('./controllers/messages');

const checkAuth = require('./middlewares/checkAuth');
const findRoom = require('./middlewares/findRoom');

router.use(checkAuth);
router.get('/', roomsController.getList);

router.use('/:room', findRoom);
router.get('/:room', messagesController.getList);
router.post('/:room', messagesController.send);

exports.name = 'chat';
exports.router = router;
exports.serviceInterface = require('./api');