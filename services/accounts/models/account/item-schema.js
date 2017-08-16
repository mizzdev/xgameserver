'use strict';

const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  itemId: { type: Number, required: true },
  level: { type: Number, min: 1 },
  quantity: { type: Number, min: 1, default: 1 }
});
