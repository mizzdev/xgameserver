'use strict';

const express = require('express');
const passport = require('passport');

const ensureLogin = require('connect-ensure-login');
const userLocals = require('../middlewares/user-locals');

const config = require('../config.json');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: config['DASHBOARD_ROOT'] + '/login'
  }),
  (req, res) => res.redirect(config['DASHBOARD_ROOT'])
);

router.use(ensureLogin.ensureLoggedIn(config['DASHBOARD_ROOT'] + '/login'));
router.use(userLocals);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(config['DASHBOARD_ROOT'] + '/login');
});

router.get('/', (req, res) => {
  res.render('home');
});

module.exports = router;
