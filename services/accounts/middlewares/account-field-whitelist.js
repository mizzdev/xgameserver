'use strict';

const config = require('../config.json');

module.exports = function(req, res, next) {
  Object.keys(req.body).forEach((key) => {
    if (!config['ACCOUNTS_FIELD_WHITELIST'].some((field) => (field === key))) {
      delete req.body[key];
    }
  });

  next();
};
