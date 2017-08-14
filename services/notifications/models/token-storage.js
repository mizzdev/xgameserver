'use strict';

const mongoose = require('mongoose');
const config = require('../config.json');

const tokenStorageSchema = new mongoose.Schema({
  accountId: { type: Number, required: true, unique: true },
  lang: { type: String },
  deviceTokensIOS: [{ type: String, minlength: 64, maxlength: 64 }],
  deviceTokensAndroid: [String]
});

function addToken(accountId, token, field) {
  const query = { accountId };
  query[field] = { $not: {
    $elemMatch: { $eq: token }
  } };

  const update = { $push: {} };
  update.$push[field] = {
    $each: [ token ],
    $slice: -config['NOTIFICATIONS_MAX_DEVICE_TOKENS']
  };

  const options = { new: true, runValidators: true };

  return this.findOneAndUpdate(query, update, options);
}

tokenStorageSchema.statics.addIOSToken = function(accountId, token) {
  return addToken.call(this, accountId, token, 'deviceTokensIOS');
};

tokenStorageSchema.statics.addAndroidToken = function(accountId, token) {
  return addToken.call(this, accountId, token, 'deviceTokensAndroid');
};

module.exports = mongoose.model('TokenStorage', tokenStorageSchema);
