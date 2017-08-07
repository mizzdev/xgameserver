'use strict';

const moment = require('moment');
const serviceRegistry = require('../../registry');

function formatDate(date) {
  return moment(date).format('DD.MM.YYYY HH:mm:ss');
}

exports.overview = function(req, res) {
  res.render('notifications');
};

exports.getInbox = function(req, res) {
  const notificationsService = serviceRegistry.getService('notifications');

  notificationsService.getInbox(req.params.accountId)
    .then((notifications) => notifications.map((notification) => {
      notification = notification.toObject();
      notification.createdAt = formatDate(notification.createdAt);
      notification.updatedAt = formatDate(notification.updatedAt);

      return notification;
    }))
    .then((notifications) => {
      res.locals.accountId = req.params.accountId;
      res.locals.notifications = notifications;
    })
    .then(() => res.render('partials/inbox'));
};

exports.send = function(req, res) {
  const notificationsService = serviceRegistry.getService('notifications');

  const notification = {
    accountId: req.params.accountId,
    title: req.body.title,
    content: req.body.content
  };

  notificationsService.send(notification)
    .then(() => res.send('OK'));
};
