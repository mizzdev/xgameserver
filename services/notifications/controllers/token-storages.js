'use strict';

const log4js = require('log4js');
const TokenStorage = require('../models/token-storage');

exports.setLanguage = function(req, res) {
  req.tokenStorage.lang = req.body.lang;

  req.tokenStorage.save()
    .then(() => res.json({}));
};

exports.getLanguage = function(req, res) {
  res.json({ lang: req.tokenStorage.lang });
};

exports.addIOSToken = function(req, res) {
  TokenStorage.addIOSToken(req.params.accountId, req.body.token)
    .then(() => res.json({}))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send('Improper Device Token');
      }

      throw err;
    });
};

exports.getIOSTokenList = function(req, res) {
  res.json(req.tokenStorage.deviceTokensIOS);
};

exports.addAndroidToken = function(req, res) {
  TokenStorage.addAndroidToken(req.params.accountId, req.body.token)
    .then(() => res.json({}))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send('Improper Device Token');
      }

      throw err;
    });
};

exports.getAndroidTokenList = function(req, res) {
  res.json(req.tokenStorage.deviceTokensAndroid);
};
