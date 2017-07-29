'use strict';

const express = require('express');
const router = express.Router();

const chatRoomsController = require('./controllers/chat-rooms');
const messagesController = require('./controllers/messages');
const checkAuth = require('./middlewares/checkAuth');
const trace = require('./middlewares/trace');

router.use(checkAuth);
router.get('/', trace, chatRoomsController.getList);
router.get('/:roomName', trace, messagesController.getList);
router.post('/:roomName', trace, messagesController.send);

exports.name = 'chat';
exports.router = router;
