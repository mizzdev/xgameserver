'use strict';

const Promise = require('bluebird');
const Notification = require('./models/notification');

exports.getInbox = function(accountId) {
  return Notification.find({ accountId });
};

exports.send = function(data) {
  return Promise.resolve()
    .then(() => {
      const notification = new Notification(data);
      return notification.save();
    });
};
