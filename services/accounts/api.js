'use strict';

const should = require('should');

const Account = require('./models/account');
const Violator = require('./models/violator');
const itemTables = require('./item-tables');

exports.getCount = function() {
  return Account.count();
};

exports.getItemProperties = function(items) {
  return Promise.resolve()
    .then(() => {
      if (typeof items === 'object') {
        const item = items;
        return itemTables.getProps(item.itemId);
      }

      return items.map((item) => itemTables.getProps(item.itemId));
    });
};

exports.getAccountById = function(id) {
  return Account.findOne({ id });
};

exports.addItem = function(accountId, item) {
  return Account.findOne({ id: accountId })
    .then((account) => account.semaphorize('addItems', [ [ item ] ]))
    .then(() => Account.findOne({ id: accountId }));
};

exports.removeItem = function(accountId, item) {
  return Account.findOne({ id: accountId })
    .then((account) => account.semaphorize('removeItems', [ [ item ] ]))
    .then(() => Account.findOne({ id: accountId }));
};

exports.addItems = function(accountId, items) {
  return Account.findOne({ id: accountId })
    .then((account) => account.semaphorize('addItems', [ items ]))
    .then(() => Account.findOne({ id: accountId }));
};

exports.removeItems = function(accountId, items) {
  return Account.findOne({ id: accountId })
    .then((account) => account.semaphorize('removeItems', [ items ]))
    .then(() => Account.findOne({ id: accountId }));
};

exports.addGold = function(accountId, amount) {
  return Account.incGold(accountId, amount);
};

exports.subGold = function(accountId, amount) {
  return Account.incGold(accountId, -amount)
    .then((result) => {
      should(result).be.true('Not Enough Gold');
    });
};

exports.addGems = function(accountId, amount) {
  return Account.incGems(accountId, amount);
};

exports.subGems = function(accountId, amount) {
  return Account.incGems(accountId, -amount)
    .then((result) => {
      should(result).be.true('Not Enough Gems');
    });
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
