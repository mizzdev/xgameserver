'use strict';

const Account = require('../models/account');

exports.create = function(req, res) {
  const account = new Account(req.body);
  account.save()
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

      Object.keys(req.body).forEach((key) => {
        account[key] = req.body[key];
      });

      return account.save()
        .then((account) => res.json(account));
    })
    .catch((err) => res.status(500).send(err.message));
};
