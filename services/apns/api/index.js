'use strict';

const connect = require('./connect');
const send = require('./send');

module.exports = function(serviceProvider) {
  const state = {
    apnProvider: null,
    bundleId: null
  };

  const api = {};

  api.connect = connect(serviceProvider, state);
  api.send = send(serviceProvider, state);

  return api;
};
