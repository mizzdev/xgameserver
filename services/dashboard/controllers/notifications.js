'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const serviceRegistry = require('../../registry');

function formatDate(date) {
  return moment(date).format('DD.MM.YYYY HH:mm:ss');
}

exports.overview = function(req, res) {
  res.render('notifications/index');
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
    .then(() => res.render('notifications/inbox'));
};

exports.send = function(req, res) {
  const notificationsService = serviceRegistry.getService('notifications');

  const notification = {
    accountId: req.params.accountId,
    title: req.body.title,
    content: req.body.content
  };

  notificationsService.send(notification)
    .then((result) => res.locals.result = result)
    .catch((err) => res.locals.error = err.message)
    .finally(() => res.render('notifications/sender'));
};

exports.broadcast = function(req, res) {
  const notificationsService = serviceRegistry.getService('notifications');

  const notification = {
    title: req.body.title,
    content: req.body.content
  };

  notificationsService.broadcast(notification)
    .then((result) => res.locals.result = result)
    .catch((err) => res.locals.error = err.message)
    .finally(() => res.render('notifications/broadcaster'));
};
