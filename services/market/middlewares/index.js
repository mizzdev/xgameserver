'use strict';

const checkAuth = require('./check-auth');
const findAccount = require('./find-account');

module.exports = function(serviceRegistry) {
  const middlewares = {};

  middlewares.checkAuth = checkAuth(serviceRegistry);
  middlewares.findAccount = findAccount(serviceRegistry);

  return middlewares;
};
