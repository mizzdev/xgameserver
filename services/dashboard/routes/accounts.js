'use strict';

const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accounts');

router.get('/', accountsController.overview);

module.exports = router;
