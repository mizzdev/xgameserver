'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');
const random = require('mongoose-random');

const itemSchema = require('./item-schema');

const config = require('../config.json');

const orderSchema = new mongoose.Schema({
  ownerId: { type: Number, required: true },
  ownerNickname: { type: String, required: true },
  item: { type: itemSchema, required: true },
  cost: { type: Number, required: true, min: 0, max: config['MARKET_MAX_ORDER_COST'] },
  currency: { type: String, required: true, enum: ['gold', 'gems'] }
});
orderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'id'
});
orderSchema.plugin(timestamp);
orderSchema.plugin(random);

orderSchema.statics.sample = function(minLevel, limit) {
  limit = limit || config['MARKET_MAX_SAMPLED_ORDERS'];

  const query = {};

  if (minLevel) {
    query.minLevel = minLevel;
  }

  return this.findRandom(query).limit(limit).exec();
};

module.exports = mongoose.model('Order', orderSchema);
