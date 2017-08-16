'use strict';

const moment = require('moment');
const Notification = require('../models/notification');

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

      return notification;
    }))
    .then((notifications) => res.json(notifications));
};

exports.markAsSeen = function(req, res) {
  Notification.markAsSeen(req.params.notificationId)
    .then((notification) => {
      if (!notification) {
        return res.status(404).send('Notification Not Found');
      }

      return res.json({});
    });
};
