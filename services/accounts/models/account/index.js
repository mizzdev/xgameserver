'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');

const env = require('../../../../env');

const semaphorize = require('./semaphorize');

const balance = require('./balance');
const inventory = require('./inventory');
const itemSchema = require('./item-schema');

const accountSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  exp: { type: Number, default: 0 },
  bp: { type: Number, default: 0 },
  balanceGold: { type: Number, default: 0 },
  balanceGems: { type: Number, default: 0 },
  userEmail: String,
  userPassword: String,
  inventory: [ itemSchema ],
  capacity: { type: Number, default: env('ACCOUNTS_STARTING_CAPACITY') },
  _lock: Date, // Semaphore lock timestamp (one needs this to perform certain complex operations atomically)
  _now: Date // Current db timestamp
});

accountSchema.plugin(autoIncrement.plugin, {
  model: 'Account',
  field: 'id'
});
accountSchema.plugin(timestamp);
accountSchema.plugin(semaphorize);

accountSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret._lock;
    delete ret._now;

    if (ret.userEmail) { delete ret.userEmail; }
    if (ret.userPassword) { delete ret.userPassword; }

    return ret;
  }
});

accountSchema.statics.incGold = balance.incGold;
accountSchema.statics.incGems = balance.incGems;

accountSchema.methods.addItems = inventory.addItems;
accountSchema.methods.removeItems = inventory.removeItems;

module.exports = mongoose.model('Account', accountSchema);
