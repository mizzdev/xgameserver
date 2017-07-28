'use strict';

const mongoose = require('mongoose');

const authNonceSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nonce: { type: Number, required: true }
});

module.exports = mongoose.model('AuthNonce', authNonceSchema);
