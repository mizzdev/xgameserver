'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const should = require('should');

const Account = require('./account');

const violationSchema = new mongoose.Schema({
  subject: { type: String, required: true }
});
violationSchema.plugin(timestamp);

const violatorSchema = new mongoose.Schema({
  accountId: { type: Number, required: true },
  nickname: String,
  violations: [ violationSchema ]
});

function appendViolation(account, violator, subject) {
  violator.violations.push({ subject });
  violator.nickname = account.nickname;
  return violator.save();
}

violatorSchema.statics.markById = function(accountId, subject) {
  should(subject).have.type('string', 'Please specify a proper subject');

  return Account.findOne({ id: accountId })
    .then((account) => {
      should.exist(account, 'Account with such ID is not found');

      return this.findOne({ accountId })
        .then((violator) => {
          if (violator) {
            return appendViolation(account, violator, subject);
          }

          violator = new this({ accountId });
          return appendViolation(account, violator, subject);
        });
    });
};

violatorSchema.statics.forgiveById = function(accountId) {
  return this.findOne({ accountId }).remove().exec();
};

module.exports = mongoose.model('Violator', violatorSchema);
