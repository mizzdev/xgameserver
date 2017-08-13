'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('./controllers/accounts');

const checkAuth = require('./middlewares/check-auth');
const checkIdentity = require('./middlewares/check-identity');
const accountFieldWhitelist = require('./middlewares/account-field-whitelist');
const findAccount = require('./middlewares/find-account');

router.post('/', accountsController.create);

router.use(checkAuth);

router.use('/:id', checkIdentity, findAccount);

router.get('/:id', accountsController.read);
router.put('/:id', accountFieldWhitelist, accountsController.update);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = require('./api');
