'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');

const accountSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  exp: { type: Number, default: 0 },
  bp: { type: Number, default: 0 },
  balanceGold: { type: Number, default: 0 },
  balanceGems: { type: Number, default: 0 },
  userEmail: String,
  userPassword: String
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

    if (ret.userEmail) { delete ret.userEmail; }
    if (ret.userPassword) { delete ret.userPassword; }

    return ret;
  }
});

module.exports = mongoose.model('Account', accountSchema);
