'use strict';

const TokenStorage = require('../models/token-storage');

module.exports = function(req, res, next) {
  TokenStorage.findOne({ accountId: req.params.accountId })
    .then((tokenStorage) => {
      if (!tokenStorage) {
        return new TokenStorage({ accountId: req.params.accountId }).save();
      }

      return tokenStorage;
    })
    .then((tokenStorage) => {
      req.tokenStorage = tokenStorage;
      next();
    });
};
