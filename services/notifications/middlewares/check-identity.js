'use strict';

const serviceRegistry = require('../../registry');

module.exports = function(req, res, next) {
  const accountsService = serviceRegistry.getService('accounts');

  if (!req.params.accountId) {
    return next(); // Ignore identity where it is not needed
  }

  if (req.accountId === Number(req.params.accountId)) {
    return next();
  }

  accountsService.markViolator(req.accountId, 'Identity Mismatch')
    .then(() => res.status(403).send('Identity Mismatch'));
};
