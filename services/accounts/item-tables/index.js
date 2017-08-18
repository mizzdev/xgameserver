'use strict';

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

const logger = log4js.getLogger('accounts');

let _propsTable = {};
let _equipWhitelist = [];

const propsTablePath = path.join(__dirname, 'props.json');
const equipWhitelistPath = path.join(__dirname, 'equip-whitelist.json');

if  (fs.existsSync(propsTablePath)) {
  _propsTable = require('./props.json');
  logger.debug('Succesfully loaded item properties table');
} else {
  logger.warn('There is no ./item-tables/props.json yet. If you create one, you will be able to specify individual item properties depending on item id using { itemId: { properties } } schema');
  logger.warn('Please see ./item-tables/props.example.json for example');
}

if  (fs.existsSync(equipWhitelistPath)) {
  _equipWhitelist = require('./equip-whitelist.json');
  logger.debug('Succesfully loaded item properties table');
} else {
  logger.warn(
    'There is no ./item-tables/equip-whitelist.json yet.',
    'The characters won\'t be able to equip any items. Please create this file using [ "type1", "type2", "type3" ] schema'
  );
  logger.warn('Please see ./item-tables/equip-whitelist.example.json for example');
}

exports.getProps = function(itemId) {
  if (!_propsTable[itemId]) {
    logger.warn(`Item ID ${itemId} is not found in the item properties table. Item operating actions with this item may (and commonly will) lead to unexpected consequences`);
    return {};
  }
  return _propsTable[itemId];
};

exports.getEquipWhitelist = function() {
  if (!_equipWhitelist.length) {
    logger.warn('Equip whitelist is not found, do not try to equip any items');
  }

  return _equipWhitelist;
};
