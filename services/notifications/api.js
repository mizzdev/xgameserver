'use strict';

const Promise = require('bluebird');
const should = require('should');
const Notification = require('./models/notification');

const serviceRegistry = require('../registry.js');

function sendPushNotificationIOS(account, message) {
  const apnsService = serviceRegistry.getService('apns');

  return Promise.resolve()
    .then(() => {
      should(account.deviceTokensIOS.length)
        .be.greaterThan(0, 'No devices assigned');
    })
    .then(() => {
      return Promise.map(account.deviceTokensIOS, (deviceToken) => {
        return apnsService.send(deviceToken, message);
      });
    });
}

function sendPushNotificationAndroid(account, message) {
  const gcmService = serviceRegistry.getService('gcm');

  return Promise.resolve()
    .then(() => {
      should(account.deviceTokensAndroid.length)
        .be.greaterThan(0, 'No devices assigned');
    })
    .then(() => {
      return Promise.map(account.deviceTokensAndroid, (deviceToken) => {
        return gcmService.send(deviceToken, message);
      });
    });
}

exports.getInbox = function(accountId) {
  return Notification.find({ accountId });
};

exports.send = function(data) {
  const result = [];

  return Promise.resolve()
    .then(() => {
      const accountsService = serviceRegistry.getService('accounts');
      return accountsService.getAccountById(data.accountId);
    })
    .then((account) => {
      should.exist(account, 'Recipient account missing');

      const notification = new Notification(data);
      return notification.save()
        .then(() => result.push({ type: 'Inbox' }))
        .return(account);
    })
    .then((account) => {
      const pushNotificationQueries = [];

      pushNotificationQueries.push(
        sendPushNotificationIOS(account, data.title)
          .then(() => result.push({ type: 'iOS Push Notification' }))
          .catch((err) => result.push({
            type: 'iOS Push Notification',
            error: err.message
          }))
      );
      pushNotificationQueries.push(
        sendPushNotificationAndroid(account, data.title)
          .then(() => result.push({ type: 'Android Push Notification' }))
          .catch((err) => result.push({
            type: 'Android Push Notification',
            error: err.message
          }))
      );

      return Promise.all(pushNotificationQueries);
    })
    .return(result);
};
