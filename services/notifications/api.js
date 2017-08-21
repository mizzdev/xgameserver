'use strict';

const Promise = require('bluebird');
const should = require('should');
const log4js = require('log4js');

const Notification = require('./models/notification');
const TokenStorage = require('./models/token-storage');

const config = require('./config.json');
const i18n = require('./i18n');
const serviceRegistry = require('../registry.js');

const logger = log4js.getLogger('notifications');

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

function unpackAtomic(accountId, notificationId) {
  return Notification.lock(notificationId)
    .then((lockSuccess) => {
      if (!lockSuccess) {
        logger.warn('Notification ID', notificationId, 'is still locked by its semaphore');
        return Promise.delay(config['NOTIFICATIONS_SEMAPHORE_CHECK_INTERVAL'])
          .then(unpackAtomic.bind(null, accountId, notificationId));
      }

      const accountsService = serviceRegistry.getService('accounts');

      return Notification.findOne({ accountId, id: notificationId })
        .then((notification) => {
          if (!notification) {
            throw new Error('Notification Not Found');
          }

          return Promise.resolve(notification)
            .then((notification) => {
              if (!notification) {
                return;
              }

              return Promise.resolve()
                .then(() => {
                  if (!(notification.cargo.items && notification.cargo.items.length)) {
                    return;
                  }

                  return accountsService.addItems(notification.accountId, notification.cargo.items);
                })
                .then(() => {
                  if (!notification.cargo.gold) {
                    return;
                  }

                  return accountsService.addGold(notification.accountId, notification.cargo.gold);
                })
                .then(() => {
                  if (!notification.cargo.gems) {
                    return;
                  }

                  return accountsService.addGems(notification.accountId, notification.cargo.gems);
                });
            })
            .then((notification) => Notification.remove({ accountId: notification.accountId, id: notification.id }))
            .catch((err) => {
              Notification.unlock(notificationId);
              logger.error('Failed to unpack notification ID', notificationId, '(' + err.message + ')');
              throw err;
            });
        });
    });
}

exports.getInbox = function(accountId) {
  return Notification.find({ accountId });
};

exports.unpack = function(accountId, notificationId) {
  logger.debug('Intending to unpack notification ID', notificationId);
  return unpackAtomic(accountId, notificationId)
    .then(() => logger.debug('Unpacked notification ID', notificationId));
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

      data.title = i18n(data.title, tokenStorage.lang);
      data.content = i18n(data.content, tokenStorage.lang);

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

  const query = {};

  if (data.lang) {
    query.lang = data.lang;
  }

  if (data.lang === 'en') {
    delete query.lang;
    query.$or = [
      { lang: 'en' },
      { lang: { $exists: false } }
    ];
  }

  return TokenStorage.find(query)
    .then((tokenStorages) => {
      total = tokenStorages.length;

      return Promise.map(tokenStorages, (tokenStorage) => {
        const notificationQueries = [];

        const notification = {
          accountId: tokenStorage.accountId,
          title: i18n(data.title, tokenStorage.lang),
          content: i18n(data.content, tokenStorage.lang)
        };

        notificationQueries.push(inboxJob(notification));
        notificationQueries.push(iOSJob(tokenStorage, notification.title));
        notificationQueries.push(androidJob(tokenStorage, notification.title));

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
