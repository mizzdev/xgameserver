'use strict';

const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat');

router.get('/', chatController.overview);
router.post('/expand', chatController.expand);
router.post('/shrink', chatController.shrink);

module.exports = router;
