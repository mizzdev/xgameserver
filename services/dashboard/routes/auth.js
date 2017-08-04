'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/', authController.overview);
router.post('/:id/unban', authController.unban);

module.exports = router;
