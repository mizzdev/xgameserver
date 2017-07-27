'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('./controllers/accounts');

router.get('/:id', accountsController.read);
router.put('/:id', accountsController.update);
router.post('/', accountsController.create);

exports.name = 'accounts';
exports.router = router;
exports.serviceInterface = {};
