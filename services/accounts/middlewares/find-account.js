'use strict';

const Account = require('../models/account');

module.exports = function(req, res, next) {
  Account.findOne({ id: req.params.id })
    .then((account) => {
      if (!account) {
        return res.status(404).send('Account Not Found');
      }

      req.account = account;
      next();
    });
};
