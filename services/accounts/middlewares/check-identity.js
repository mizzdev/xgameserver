'use strict';

const api = require('../api');

module.exports = function(req, res, next) {
  if (!req.params.id) {
    return next(); // Ignore identity where it is not needed
  }

  if (req.accountId === Number(req.params.id)) {
    return next();
  }

  api.markViolator(req.accountId, 'Identity Mismatch')
    .then(() => res.status(403).send('Identity Mismatch'));
};
