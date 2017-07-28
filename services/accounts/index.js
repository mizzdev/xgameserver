'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('./controllers/accounts');

const checkAuth = require('./middlewares/checkAuth');
const accountFieldWhitelist = require('./middlewares/accountFieldWhitelist');

router.get('/:id', checkAuth, accountsController.read);
router.put('/:id', checkAuth, accountFieldWhitelist, accountsController.update);
router.post('/', accountsController.create);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = {};
