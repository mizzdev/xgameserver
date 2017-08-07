'use strict';

const Promise = require('bluebird');
const should = require('should');
const Notification = require('./models/notification');

const serviceRegistry = require('../registry.js');

exports.getInbox = function(accountId) {
  return Notification.find({ accountId });
};

exports.send = function(data) {
  return Promise.resolve()
    .then(() => {
      const notification = new Notification(data);
      return notification.save();
    })
    .then(() => {
      const accountsService = serviceRegistry.getService('accounts');
      return accountsService.getAccountById(data.accountId);
    })
    .then((account) => {
      should.exist(account, 'Recipient account missing');
      return account;
    })
    .tap((account) => {
      const apnsService = serviceRegistry.getService('apns');

      return Promise.map(account.deviceTokensIOS, (deviceToken) => {
        return apnsService.send(deviceToken, data.title);
      }).catch(() => {
        throw new Error('APNS Delivery Failed');
      });
    });
};
