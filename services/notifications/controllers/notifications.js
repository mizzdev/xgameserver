'use strict';

const moment = require('moment');
const Notification = require('../models/notification');

const api = require('../api');
const config = require('../config.json');

exports.getInbox = function(req, res) {
  Notification.find({ accountId: req.params.accountId })
    .limit(config['NOTIFICATIONS_INBOX_LIMIT'])
    .exec()
    .then((notifications) => notifications.map((notification) => {
      notification = notification.toObject();

      const time = moment.utc(notification.createdAt).format('HH:mm');
      const diff = Date.now() - Number(notification.createdAt);
      const daysAgo = Math.floor(diff / 86400000);

      notification.days = daysAgo;
      notification.time = time;

      delete notification._id;
      delete notification.__v;
      delete notification.accountId;
      delete notification.createdAt;
      delete notification.updatedAt;

      if (notification.cargo) {
        delete notification.cargo._id;

        notification.cargo.items.forEach((item) => {
          delete item._id;
        });

        if (!notification.cargo.items.length) {
          delete notification.cargo.items;
        }

        if (!notification.cargo.gold && !notification.cargo.gems && !notification.cargo.items) {
          delete notification.cargo;
        }
      }

      return notification;
    }))
    .then((notifications) => res.json(notifications));
};

exports.markAsSeen = function(req, res) {
  Notification.markAsSeen(req.params.accountId, req.params.notificationId)
    .then((notification) => {
      if (!notification) {
        return res.status(404).send('Notification Not Found');
      }

      return res.json({});
    });
};

exports.unpack = function(req, res) {
  return api.unpack(req.params.accountId, req.params.notificationId)
    .then(() => res.json({}))
    .catch((err) => {
      switch (err.message) {
      case 'Notification Not Found':
        res.status(404).send(err.message);
        break;
      case 'Document not found':
        res.status(404).send('Notification Not Found');
        break;
      case 'Not enough space':
        res.status(400).send('Not Enough Space');
        break;
      default:
        res.status(500).send('Internal Server Error');
        throw err;
      }
    });
};
