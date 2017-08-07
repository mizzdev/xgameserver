'use strict';

const moment = require('moment');
const Notification = require('../models/notification');

exports.getInbox = function(req, res) {
  Notification.find({ accountId: req.params.accountId })
    .then((notifications) => notifications.map((notification) => {
      notification = notification.toObject();

      delete notification._id;
      delete notification.__v;
      delete notification.accountId;
      delete notification.updatedAt;

      const time = moment.utc(notification.createdAt).format('HH:mm');
      const diff = Date.now() - Number(notification.createdAt);
      const daysAgo = Math.floor(diff / 86400000);

      notification.createdAt = {
        days: daysAgo,
        time: time
      };

      return notification;
    }))
    .then((notifications) => res.json(notifications));
};
