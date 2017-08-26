'use strict';

const should = require('should');
const config = require('../../config.json');

exports.incGold = function(accountId, amount) {
  should(amount).be.a.Number();

  const query = {
    id: accountId,
    balanceGold: { $gte: -amount }
  };

  return this.update(query, { $inc: { balanceGold: amount } })
    .then((result) => Boolean(result.n));
};

exports.incGems = function(accountId, amount) {
  should(amount).be.a.Number();

  const query = {
    id: accountId,
    balanceGems: { $gte: -amount }
  };

  return this.update(query, { $inc: { balanceGems: amount } })
    .then((result) => Boolean(result.n));
};

exports.expandOrderCells = function(accountId) {
  const gemAmount = -config['ACCOUNT_ORDER_CELL_EXPANSION_GEM_COST'];

  const query = {
    id: accountId,
    balanceGems: { $gte: -gemAmount }
  };

  return this.update(query, { $inc: {
    balanceGems: gemAmount,
    orderCellsUnlocked: 1
  } })
    .then((result) => Boolean(result.n));
};
