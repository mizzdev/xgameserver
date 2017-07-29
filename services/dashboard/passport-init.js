'use strict';

const passport = require('passport');
const passportLocal = require('passport-local');
const DashboardUser = require('./models/dashboard-user');

passport.use(new passportLocal.Strategy((username, password, callback) => {
  DashboardUser.findOne({ username })
    .then((user) => {
      if (!user) {
        return callback(null, false);
      }

      if (user.password !== password) {
        return callback(null, false);
      }

      return callback(null, user);
    })
    .catch((err) => callback(err));
}));

passport.serializeUser(function(user, callback) {
  callback(null, user._id);
});

passport.deserializeUser(function(id, callback) {
  DashboardUser.findOne({ _id: id })
    .then((user) => callback(null, user))
    .catch((err) => callback(err));
});
