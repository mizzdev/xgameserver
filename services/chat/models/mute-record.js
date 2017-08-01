'use strict';

const mongoose = require('mongoose');

const muteRecordSchema = new mongoose.Schema({
  accountId: { type: Number, required: true },
  expiry: { type: Date, required: true }
});

muteRecordSchema.statics.mute = function(accountId, duration) {
  const expiry = new Date(Date.now() + duration);

  return this.findOne({ accountId })
    .then((record) => {
      if (!record) {
        record = new this({ accountId, expiry });
        return record.save();
      }

      record.expiry = expiry;
      return record.save();
    });
};

muteRecordSchema.statics.getStatus = function(accountId) {
  return this.findOne({ accountId })
    .then((record) => {
      if (!record) {
        return { muted: false };
      }

      if (Date.now() > record.expiry) {
        return { muted: false };
      }

      return { muted: true, expiry: record.expiry };
    });
};

module.exports = mongoose.model('MuteRecord', muteRecordSchema);
