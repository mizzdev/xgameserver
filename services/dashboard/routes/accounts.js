'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accounts');
const violatorsController = require('../controllers/accounts/violators');

router.get('/', accountsController.overview);
router.get('/violators/:id', violatorsController.read);

module.exports = router;
