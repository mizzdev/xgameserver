'use strict';

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

const logger = log4js.getLogger('accounts');

let _propsTable = {};

const propsTablePath = path.join(__dirname, 'props.json');

if  (fs.existsSync(propsTablePath)) {
  _propsTable = require('./props.json');
  logger.debug('Succesfully loaded item properties table');
} else {
  logger.warn('There is no ./items/props.json yet. If you create one, you will be able to specify individual item properties depending on item id using { itemId: { properties } } schema');
  logger.warn('Please see ./items/props.example.json for example');
}

exports.getProps = function(itemId) {
  if (!_propsTable[itemId]) {
    logger.warn(`Item ID ${itemId} is not found in the item properties table. Item operating actions with this item may (and commonly will) lead to unexpected consequences`);
    return {};
  }
  return _propsTable[itemId];
};
