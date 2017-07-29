'use strict';

const mongoose = require('mongoose');

const dashboardUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('DashboardUser', dashboardUserSchema);
