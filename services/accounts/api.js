'use strict';

const Promise = require('bluebird')
const should = require('should');

const Account = require('./models/account');
const Violator = require('./models/violator');

const config = require('./config');

function addItemAtomic(accountId, item) {
  return Account.lock(accountId)
    .then((lockSuccess) => {
      if (!lockSuccess) {
        return Promise.delay(config['ACCOUNT_SEMAPHORE_CHECK_INTERVAL'])
          .then(addItemAtomic.bind(null, accountId, item));
      }

      return Account.findOne({ id: accountId }).exec()
        .then((account) => account.addItem(item))
        .then(() => Account.findOne({ id: accountId }).exec())
        .finally(() => Account.unlock(accountId));
    });
}

function removeItemAtomic(accountId, item) {
  return Account.lock(accountId)
    .then((lockSuccess) => {
      if (!lockSuccess) {
        return Promise.delay(config['ACCOUNT_SEMAPHORE_CHECK_INTERVAL'])
          .then(removeItemAtomic.bind(null, accountId, item));
      }

      return Account.findOne({ id: accountId }).exec()
        .then((account) => account.removeItem(item))
        .then(() => Account.findOne({ id: accountId }).exec())
        .finally(() => Account.unlock(accountId));
    });
}

exports.getCount = function() {
  return Account.count();
};

exports.getAccountById = function(id) {
  return Account.findOne({ id });
};

exports.addItem = function(accountId, item) {
  return addItemAtomic(accountId, item);
};

exports.removeItem = function(accountId, item) {
  return removeItemAtomic(accountId, item);
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
