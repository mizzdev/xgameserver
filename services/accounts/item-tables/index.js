'use strict';

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

const logger = log4js.getLogger('accounts');

let _stackTable = {};

const stackTablePath = path.join(__dirname, 'stack.json');

if  (fs.existsSync(stackTablePath)) {
  _stackTable = require('./stack.json');
  logger.debug('Succesfully loaded item stack table');
} else {
  logger.warn('There is no ./items/stack.json yet. If you create one, you will be able to specify individual stack size limits depending on item id using { itemId: stackSize } schema');
  logger.warn('Please see ./items/stack.example.json for example');
}

exports.stackSize = function(itemId) {
  return _stackTable[itemId] || 1;
};
