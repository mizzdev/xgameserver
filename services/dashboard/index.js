'use strict';

const path = require('path');
const express = require('express');
const passport = require('passport');
const config = require('./config.json');

const app = express();

require('./passport-init');
require('./user-init');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals.rootPath = config['DASHBOARD_ROOT'];
app.locals.title = config['DASHBOARD_TITLE'];

app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: config['DASHBOARD_SESSION_SECRET'],
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));

exports.name = 'dashboard';
exports.router = app;
