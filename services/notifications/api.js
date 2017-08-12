'use strict';

const Promise = require('bluebird');
const should = require('should');

const Notification = require('./models/notification');
const TokenStorage = require('./models/token-storage');

const serviceRegistry = require('../registry.js');

function sendPushNotificationIOS(tokenStorage, message) {
  const apnsService = serviceRegistry.getService('apns');

  return Promise.resolve()
    .then(() => {
      should(tokenStorage.deviceTokensIOS.length)
        .be.greaterThan(0, 'No devices assigned');
    })
    .then(() => {
      return Promise.map(tokenStorage.deviceTokensIOS, (deviceToken) => {
        return apnsService.send(deviceToken, message);
      });
    });
}

function sendPushNotificationAndroid(tokenStorage, message) {
  const gcmService = serviceRegistry.getService('gcm');

  return Promise.resolve()
    .then(() => {
      should(tokenStorage.deviceTokensAndroid.length)
        .be.greaterThan(0, 'No devices assigned');
    })
    .then(() => {
      return Promise.map(tokenStorage.deviceTokensAndroid, (deviceToken) => {
        return gcmService.send(deviceToken, message);
      });
    });
}

exports.getInbox = function(accountId) {
  return Notification.find({ accountId });
};

exports.send = function(data) {
  const result = [];

  return TokenStorage.findOne({ accountId: data.accountId })
    .then((tokenStorage) => {
      if (!tokenStorage) {
        return new TokenStorage({ accountId: data.accountId }).save();
      }

      return tokenStorage;
    })
    .then((tokenStorage) => {
      const notification = new Notification(data);
      return notification.save()
        .then(() => result.push({ type: 'Inbox' }))
        .return(tokenStorage);
    })
    .then((tokenStorage) => {
      const pushNotificationQueries = [];

      pushNotificationQueries.push(
        sendPushNotificationIOS(tokenStorage, data.title)
          .then(() => result.push({ type: 'iOS Push Notification' }))
          .catch((err) => result.push({
            type: 'iOS Push Notification',
            error: err.message
          }))
      );
      pushNotificationQueries.push(
        sendPushNotificationAndroid(tokenStorage, data.title)
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
