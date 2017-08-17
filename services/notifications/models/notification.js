'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');

const itemSchema = require('./item-schema');

const cargoSchema = new mongoose.Schema({
  gold: { type: Number, min: 0 },
  gems: { type: Number, min: 0 },
  items: [itemSchema]
});

const notificationSchema = new mongoose.Schema({
  accountId: { type: Number, required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  seen: { type: Boolean, default: false },
  cargo: { type: cargoSchema }
});

notificationSchema.plugin(autoIncrement.plugin, {
  model: 'Notification',
  field: 'id'
});
notificationSchema.plugin(timestamp);

notificationSchema.statics.markAsSeen = function(accountId, notificationId) {
  return this.findOneAndUpdate(
    { accountId, id: notificationId },
    { $set: { seen: true } },
    { new: true }).exec();
};

module.exports = mongoose.model('Notification', notificationSchema);
