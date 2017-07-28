'use strict';

const serviceRegistry = require('../../registry');

module.exports = function(req, res, next) {
  const authService = serviceRegistry.getService('auth');

  authService.verify(req.headers)
    .then(() => next())
    .catch(() => res.status(403).send('Authorization Required'));
};
