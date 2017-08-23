'use strict';

const serviceRegistry = require('../../registry');

module.exports = function(req, res, next) {
  const accountsService = serviceRegistry.getService('accounts');

  accountsService.getAccountById(req.accountId)
    .then((account) => {
      if (!account) {
        return res.status(404).send('Account Not Found');
      }

      req.account = account;
      next();
    });
};
