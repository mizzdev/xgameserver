'use strict';

const Promise = require('bluebird');
const Account = require('./models/account');

exports.getCount = function() {
  return Promise.resolve()
    .then(() => Account.count());
};
