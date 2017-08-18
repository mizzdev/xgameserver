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
    content: req.body.content,
    cargo: {}
  };

  if (Number(req.body.gold)) { notification.cargo.gold = req.body.gold; }
  if (Number(req.body.gems)) { notification.cargo.gems = req.body.gems; }
  if (req.body.items) { notification.cargo.items = JSON.parse(req.body.items); }

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

  if (req.body.lang) {
    notification.lang = req.body.lang;
  }

  notificationsService.broadcast(notification)
    .then((result) => res.locals.result = result)
    .catch((err) => res.locals.error = err.message)
    .finally(() => res.render('notifications/broadcaster'));
};
