'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');

const config = require('../config.json');

function circularizeDeviceTokensIOS() {
  const tokenCount = this.deviceTokensIOS.length;

  if (tokenCount > config['ACCOUNT_MAX_DEVICE_TOKENS']) {
    this.deviceTokensIOS.shift();
  }
}

function circularizeDeviceTokensAndroid() {
  const tokenCount = this.deviceTokensAndroid.length;

  if (tokenCount > config['ACCOUNT_MAX_DEVICE_TOKENS']) {
    this.deviceTokensAndroid.shift();
  }
}

const accountSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  exp: { type: Number, default: 0 },
  bp: { type: Number, default: 0 },
  balanceGold: { type: Number, default: 0 },
  balanceGems: { type: Number, default: 0 },
  userEmail: String,
  userPassword: String,
  deviceTokensIOS: {
    type: [{ type: String, minlength: 64, maxlength: 64 }],
    validate: circularizeDeviceTokensIOS
  },
  deviceTokensAndroid: {
    type: [String],
    validate: circularizeDeviceTokensAndroid
  }
});

accountSchema.plugin(autoIncrement.plugin, {
  model: 'Account',
  field: 'id'
});
accountSchema.plugin(timestamp);

accountSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.deviceTokensIOS;
    delete ret.deviceTokensAndroid;

    if (ret.userEmail) { delete ret.userEmail; }
    if (ret.userPassword) { delete ret.userPassword; }

    return ret;
  }
});

module.exports = mongoose.model('Account', accountSchema);
