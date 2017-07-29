'use strict';

const mongoose = require('mongoose');

const dashboardUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  defaultCredentials: { type: Boolean, default: false }
});

module.exports = mongoose.model('DashboardUser', dashboardUserSchema);
