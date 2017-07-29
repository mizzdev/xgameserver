'use strict';

const express = require('express');
const router = express.Router();

const chatRoomsController = require('./controllers/chat-rooms');
const checkAuth = require('./middlewares/checkAuth');

router.use(checkAuth);
router.get('/', chatRoomsController.getList);

exports.name = 'chat';
exports.router = router;
