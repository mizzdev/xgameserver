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

  if (Number(req.body['cargo.gold'])) { notification.cargo.gold = req.body['cargo.gold']; }
  if (Number(req.body['cargo.gems'])) { notification.cargo.gems = req.body['cargo.gems']; }
  if (req.body['cargo.items']) {
    const items = req.body['cargo.items'];

    notification.cargo.items = [];

    while (items.length) {
      const item = {};

      item.itemId = items.shift();
      item.level = items.shift();
      item.quantity = items.shift();

      notification.cargo.items.push(item);
    }
  }

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
