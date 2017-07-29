'use strict';

const log4js = require('log4js');
const Account = require('../models/account');
const serviceRegistry = require('../../registry');

const logger = log4js.getLogger('accounts');

logger.level = 'info';

exports.create = function(req, res) {
  const account = new Account(req.body);
  account.save()
    .tap((account) => logger.info(`[ID ${account.id}]`, 'registered', account.nickname))
    .then((account) => {
      const authService = serviceRegistry.getService('auth');

      authService.getKeyById(account.id)
        .then((key) => {
          logger.debug(`[ID ${account.id}]`, 'account key:', key);

          const accountData = account.toObject();
          accountData.key = key;

          res.json(accountData);
        });
    })
    .catch((err) => {
      logger.error(err.message);
      logger.error(req.body);
      res.status(500).send(err.message);
    });
};

exports.read = function(req, res) {
  Account.findOne({ id: req.params.id })
    .then((account) => {
      if (!account) {
        return res.status(404).send('Account Not Found');
      }

      return res.json(account);
    })
    .catch((err) => {
      logger.error(err.message);
      logger.error(req.body);
      res.status(500).send(err.message);
    });
};

exports.update = function(req, res) {
  Account.findOne({ id: req.params.id })
    .then((account) => {
      if (!account) {
        return res.status(404).send('Account Not Found');
      }

      if (req.body.userEmail) {
        if (account.userEmail) {
          return res.status(400).send('Email Already Assigned');
        }

        if (!req.body.userPassword) {
          return res.status(400).send('Email Must Be Provided With Password');
        }
      }

      logger.info(`[ID ${account.id}]`, 'before update:', account);

      Object.keys(req.body).forEach((key) => {
        account[key] = req.body[key];
      });

      return account.save()
        .tap((account) => logger.info(`[ID ${account.id}]`, 'after update:', account))
        .then((account) => res.json(account));
    })
    .catch((err) => {
      logger.error(err.message);
      logger.error(req.body);
      res.status(500).send(err.message);
    });
};
