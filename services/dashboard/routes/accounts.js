'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accounts');
const violatorsController = require('../controllers/accounts/violators');

router.get('/', accountsController.overview);
router.post('/ban', accountsController.ban);
router.post('/:id/ban', accountsController.ban);

router.post('/item-add', accountsController.addItem);
router.post('/item-remove', accountsController.removeItem);

router.get('/violators/:id', violatorsController.read);
router.post('/violators/:id/forgive', violatorsController.forgive);

module.exports = router;
