'use strict';

const express = require('express');
const router = express.Router();

const chatRoomsController = require('./controllers/chat-rooms');
const messagesController = require('./controllers/messages');
const checkAuth = require('./middlewares/checkAuth');

router.use(checkAuth);
router.get('/', chatRoomsController.getList);
router.get('/:roomName', messagesController.getList);
router.post('/:roomName', messagesController.send);

exports.name = 'chat';
exports.router = router;
exports.serviceInterface = require('./api');