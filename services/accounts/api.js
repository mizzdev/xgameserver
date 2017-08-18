'use strict';

const Promise = require('bluebird')
const should = require('should');

const Account = require('./models/account');
const Violator = require('./models/violator');

const config = require('./config');

function addItemsAtomic(accountId, items) {
  return Account.lock(accountId)
    .then((lockSuccess) => {
      if (!lockSuccess) {
        return Promise.delay(config['ACCOUNTS_SEMAPHORE_CHECK_INTERVAL'])
          .then(addItemsAtomic.bind(null, accountId, items));
      }

      return Account.findOne({ id: accountId }).exec()
        .then((account) => account.addItems(items))
        .then(() => Account.findOne({ id: accountId }).exec())
        .finally(() => Account.unlock(accountId));
    });
}

function removeItemsAtomic(accountId, items) {
  return Account.lock(accountId)
    .then((lockSuccess) => {
      if (!lockSuccess) {
        return Promise.delay(config['ACCOUNT_SEMAPHORE_CHECK_INTERVAL'])
          .then(removeItemsAtomic.bind(null, accountId, items));
      }

      return Account.findOne({ id: accountId }).exec()
        .then((account) => account.removeItems(items))
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
  return addItemsAtomic(accountId, [ item ]);
};

exports.removeItem = function(accountId, item) {
  return removeItemsAtomic(accountId, [ item ]);
};

exports.addItems = function(accountId, items) {
  return addItemsAtomic(accountId, items);
};

exports.removeItems = function(accountId, items) {
  return removeItemsAtomic(accountId, items);
};

exports.addGold = function(accountId, amount) {
  return Account.incGold(accountId, amount);
};

exports.subGold = function(accountId, amount) {
  return Account.incGold(accountId, -amount);
};

exports.addGems = function(accountId, amount) {
  return Account.incGems(accountId, amount);
};

exports.subGems = function(accountId, amount) {
  return Account.incGems(accountId, -amount);
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

exports.foraddViolator = function(accountId) {
  return Violator.foraddById(accountId);
};
