'use strict';

const mongoose = require('mongoose');
const config = require('../config.json');

function circularizeDeviceTokensIOS() {
  const tokenCount = this.deviceTokensIOS.length;

  if (tokenCount > config['NOTIFICATIONS_MAX_DEVICE_TOKENS']) {
    this.deviceTokensIOS.shift();
  }
}

function circularizeDeviceTokensAndroid() {
  const tokenCount = this.deviceTokensAndroid.length;

  if (tokenCount > config['NOTIFICATIONS_MAX_DEVICE_TOKENS']) {
    this.deviceTokensAndroid.shift();
  }
}

const tokenStorageSchema = new mongoose.Schema({
  accountId: { type: Number, required: true, unique: true },
  deviceTokensIOS: {
    type: [{ type: String, minlength: 64, maxlength: 64 }],
    validate: circularizeDeviceTokensIOS
  },
  deviceTokensAndroid: {
    type: [String],
    validate: circularizeDeviceTokensAndroid
  }
});

module.exports = mongoose.model('TokenStorage', tokenStorageSchema);
