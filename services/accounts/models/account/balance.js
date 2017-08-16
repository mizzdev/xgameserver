'use strict';

const should = require('should');

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
