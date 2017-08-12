'use strict';

const Promise = require('bluebird');
const should = require('should');

const Notification = require('./models/notification');
const TokenStorage = require('./models/token-storage');

const config = require('./config.json');
const serviceRegistry = require('../registry.js');

function sendInboxNotification(data) {
  const notification = new Notification(data);
  return notification.save();
}

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
      const notificationQueries = [];

      notificationQueries.push(
        sendInboxNotification(data)
          .then(() => result.push({ type: 'Inbox' }))
          .catch((err) => result.push({
            type: 'Inbox',
            error: err.message
          }))
      );
      notificationQueries.push(
        sendPushNotificationIOS(tokenStorage, data.title)
          .then(() => result.push({ type: 'iOS Push Notification' }))
          .catch((err) => result.push({
            type: 'iOS Push Notification',
            error: err.message
          }))
      );
      notificationQueries.push(
        sendPushNotificationAndroid(tokenStorage, data.title)
          .then(() => result.push({ type: 'Android Push Notification' }))
          .catch((err) => result.push({
            type: 'Android Push Notification',
            error: err.message
          }))
      );

      return Promise.all(notificationQueries);
    })
    .return(result);
};

exports.broadcast = function(data) {
  let total = 0;
  const successors = {
    inbox: 0,
    android: 0,
    iOS: 0
  };

  function inboxJob(data) {
    return sendInboxNotification(data)
      .then(() => successors.inbox++)
      .catch(() => {});
  }
  function androidJob(tokenStorage, message) {
    return sendPushNotificationIOS(tokenStorage, message)
      .then(() => successors.android++)
      .catch(() => {});
  }
  function iOSJob(tokenStorage, message) {
    return sendPushNotificationAndroid(tokenStorage, message)
      .then(() => successors.iOS++)
      .catch(() => {});
  }

  return TokenStorage.find()
    .then((tokenStorages) => {
      total = tokenStorages.length;

      return Promise.map(tokenStorages, (tokenStorage) => {
        const notificationQueries = [];

        notificationQueries.push(inboxJob(Object.assign({}, data, { accountId: tokenStorage.accountId })));
        notificationQueries.push(iOSJob(tokenStorage, data.title));
        notificationQueries.push(androidJob(tokenStorage, data.title));

        return Promise.all(notificationQueries);
      }, {
        concurrency: config['NOTIFICATIONS_BROADCAST_CONCURRENCY']
      });
    })
    .then(() => {
      return [
        { type: 'Inbox', successors: successors.inbox, total: total },
        { type: 'iOS Push Notifications', successors: successors.iOS, total: total },
        { type: 'Android Push Notifications', successors: successors.android, total: total }
      ];
    });
};
