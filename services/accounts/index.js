'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('./controllers/accounts');

const checkAuth = require('./middlewares/checkAuth');
const checkIdentity = require('./middlewares/checkIdentity');
const accountFieldWhitelist = require('./middlewares/accountFieldWhitelist');

router.post('/', accountsController.create);

router.use(checkAuth);
router.get('/:id', checkIdentity, accountsController.read);
router.put('/:id', checkIdentity, accountFieldWhitelist, accountsController.update);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = {};
