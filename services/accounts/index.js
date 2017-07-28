'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('./controllers/accounts');
const checkAuth = require('./middlewares/checkAuth');

router.get('/:id', checkAuth, accountsController.read);
router.put('/:id', checkAuth, accountsController.update);
router.post('/', checkAuth, accountsController.create);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = {};
