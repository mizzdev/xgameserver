'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('./controllers/accounts');

const checkAuth = require('./middlewares/checkAuth');
const checkIdentity = require('./middlewares/checkIdentity');
const accountFieldWhitelist = require('./middlewares/accountFieldWhitelist');
const findAccount = require('./middlewares/findAccount');

router.post('/', accountsController.create);

router.use(checkAuth);

router.use('/:id', checkIdentity, findAccount);

router.get('/:id', accountsController.read);
router.put('/:id', accountFieldWhitelist, accountsController.update);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = require('./api');
