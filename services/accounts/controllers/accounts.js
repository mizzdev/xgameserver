'use strict';

const log4js = require('log4js');
const Account = require('../models/account');

const logger = log4js.getLogger('accounts');

logger.level = 'debug';

exports.create = function(req, res) {
  const account = new Account(req.body);
  account.save()
    .tap((account) => logger.info(`[ID ${account.id}]`, 'registered', account.nickname))
    .then((account) => res.json(account))
    .catch((err) => res.status(500).send(err.message));
};

exports.read = function(req, res) {
  Account.findOne({ id: req.params.id })
    .then((account) => {
      if (!account) {
        return res.status(404).send('Account Not Found');
      }

      return res.json(account);
    })
    .catch((err) => res.status(500).send(err.message));
};

exports.update = function(req, res) {
  Account.findOne({ id: req.params.id })
    .then((account) => {
      if (!account) {
        return res.status(404).send('Account Not Found');
      }

      logger.info(`[ID ${account.id}]`, 'before update:', account);

      Object.keys(req.body).forEach((key) => {
        account[key] = req.body[key];
      });

      return account.save()
        .tap((account) => logger.info(`[ID ${account.id}]`, 'after update:', account))
        .then((account) => res.json(account));
    })
    .catch((err) => res.status(500).send(err.message));
};
