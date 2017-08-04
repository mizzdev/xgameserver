'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const should = require('should');

const banlistRecordSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  expiry: { type: Date, required: true }
});
banlistRecordSchema.plugin(timestamp);

banlistRecordSchema.statics.ban = function(accountId, durationSeconds) {
  should(durationSeconds).be.a.Number();
  should(durationSeconds).be.greaterThan(0);

  return this.findOne({ id: accountId })
    .then((record) => {
      if (record) {
        record.expiry += durationSeconds * 1000;
        return record.save();
      }

      record = new this({
        id: accountId,
        expiry: Date.now() + durationSeconds * 1000
      });
      return record.save();
    });
};

banlistRecordSchema.statics.unban = function(accountId) {
  return this.findOneAndRemove({ id: accountId });
};

banlistRecordSchema.statics.isBanned = function(accountId) {
  return this.findOne({ id: accountId })
    .then((record) => {
      if (!record) {
        return false;
      }

      if (Date.now() > record.expiry) {
        return this.findOneAndRemove({ id: accountId })
          .then(() => false);
      }

      return true;
    });
};

module.exports = mongoose.model('BanlistRecord', banlistRecordSchema);
