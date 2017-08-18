'use strict';

const express = require('express');
const log4js = require('log4js');

const logger = log4js.getLogger('accounts');
logger.level = 'info';

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

router.post('/:id/equipment', accountsController.equip);
router.delete('/:id/equipment/:bodyPart', accountsController.unequip);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = require('./api');
exports.init = function() { require('./item-tables'); };
