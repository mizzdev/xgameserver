'use strict';

const Promise = require('bluebird');
const Account = require('./models/account');
const Violator = require('./models/violator');

exports.getCount = function() {
  return Promise.resolve()
    .then(() => Account.count());
};

exports.getViolatorList = function() {
  return Violator.find();
};

exports.getViolator = function(accountId) {
  return Violator.findOne({ accountId });
};

exports.markViolator = function(accountId, subject) {
  return Violator.markById(accountId, subject);
};

exports.forgiveViolator = function(accountId) {
  return Violator.forgiveById(accountId);
};
