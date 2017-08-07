'use strict';

const Account = require('./models/account');
const Violator = require('./models/violator');

exports.getCount = function() {
  return Account.count();
};

exports.getAccountById = function(id) {
  return Account.findOne({ id });
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
