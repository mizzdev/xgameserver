'use strict';

const path = require('path');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const config = require('./config.json');
const env = require('../../env');

const app = express();

require('./passport-init');
require('./user-init');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals.rootPath = config['DASHBOARD_ROOT'];
app.locals.title = env('DASHBOARD_TITLE');

app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({
  secret: env('DASHBOARD_SESSION_SECRET'),
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'dashboardsessions'
  }),
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));

exports.name = 'dashboard';
exports.router = app;
