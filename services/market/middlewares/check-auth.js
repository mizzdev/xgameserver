'use strict';

module.exports = function(serviceRegistry) {
  return function(req, res, next) {
    const authService = serviceRegistry.getService('auth');

    authService.verify(req.headers)
      .then((id) => {
        req.accountId = id;
        next();
      })
      .catch((err) => res.status(403).send(`Authorization Failed: ${err.message}`));
  };
};
