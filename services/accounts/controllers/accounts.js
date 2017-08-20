'use strict';

const Promise = require('bluebird');
const log4js = require('log4js');
const Account = require('../models/account');
const serviceRegistry = require('../../registry');

const logger = log4js.getLogger('accounts');

exports.create = function(req, res) {
  const account = new Account(req.body);
  account.save()
    .tap((account) => logger.info(`[ID ${account.id}]`, 'registered', account.nickname))
    .then((account) => {
      const authService = serviceRegistry.getService('auth');

      authService.getKeyById(account.id)
        .then((key) => {
          logger.debug(`[ID ${account.id}]`, 'account key:', key);

          const accountData = account.toJSON();
          accountData.key = key;

          res.json(accountData);
        });
    });
};

exports.read = function(req, res) {
  res.json(req.account);
};

exports.update = function(req, res) {
  if (req.body.userEmail) {
    if (req.account.userEmail) {
      return res.status(400).send('Email Already Assigned');
    }

    if (!req.body.userPassword) {
      return res.status(400).send('Email Must Be Provided With Password');
    }
  }

  logger.info(`[ID ${req.account.id}]`, 'before update:', req.account);

  return Account.findOneAndUpdate({ _id: req.account._id }, req.body, { new: true }).exec()
    .tap((account) => logger.info(`[ID ${account.id}]`, 'after update:', account))
    .then((account) => res.json(account));
};

exports.equip = function(req, res) {
  return Promise.resolve()
    .then(() => req.account.semaphorize('equip', [ req.body.idx ]))
    .then(() => res.json({}))
    .catch((err) => {
      logger.error(`[ID ${req.account.id}]`, 'cannot equip:', err.message);
      res.status(400).send('Cannot Equip');
    });
};

exports.unequip = function(req, res) {
  return Promise.resolve()
    .then(() => req.account.semaphorize('unequip', [ req.params.bodyPart ]))
    .then(() => res.json({}))
    .catch((err) => {
      logger.error(`[ID ${req.account.id}]`, 'cannot unequip:', err.message);
      res.status(400).send('Cannot Unequip');
    });
};

exports.equipArtifact = function(req, res) {
  return Promise.resolve()
    .then(() => req.account.semaphorize('equipArtifact', [ req.body.idx, Number(req.params.artifactCellIdx) ]))
    .then(() => res.json({}))
    .catch((err) => {
      logger.error(`[ID ${req.account.id}]`, 'cannot equip artifact:', err.message);
      res.status(400).send('Cannot Equip');
    });
};

exports.unequipArtifact = function(req, res) {
  return Promise.resolve()
    .then(() => req.account.semaphorize('unequipArtifact', [ Number(req.params.artifactCellIdx) ]))
    .then(() => res.json({}))
    .catch((err) => {
      logger.error(`[ID ${req.account.id}]`, 'cannot unequip artifact:', err.message);
      res.status(400).send('Cannot Unequip');
    });
};
