'use strict';

const defaults = require('./defaults.json');

module.exports = function(variableName) {
  return process.env[variableName] || defaults[variableName];
};
