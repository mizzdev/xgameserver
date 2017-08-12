'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('notifications');

exports.setLanguage = function(req, res) {
  req.tokenStorage.lang = req.body.lang;

  req.tokenStorage.save()
    .then(() => res.json({}));
};

exports.getLanguage = function(req, res) {
  res.json({ lang: req.tokenStorage.lang });
};

exports.createIOSToken = function(req, res) {
  const token  = req.body.token;

  if (!token) {
    return res.status(400).send('Improper Device Token');
  }

  const idx = req.tokenStorage.deviceTokensIOS.indexOf(token);

  if (idx === -1) {
    // It is necessary to ensure dupe tokens absence
    logger.info(`[ID ${req.tokenStorage.accountId}]`, 'Binding new iOS token:', token);
    req.tokenStorage.deviceTokensIOS.push(token);
    return req.tokenStorage.save()
      .then(() => res.json({}))
      .catch((err) => {
        logger.error(`[ID ${req.tokenStorage.accountId}]`, 'Binding new iOS token failed:', err.message);
        res.status(400).send('Improper Device Token');
      });
  }

  res.json({});
};

exports.getIOSTokenList = function(req, res) {
  res.json(req.tokenStorage.deviceTokensIOS);
};

exports.createAndroidToken = function(req, res) {
  const token  = req.body.token;

  if (!token) {
    return res.status(400).send('Improper Device Token');
  }

  const idx = req.tokenStorage.deviceTokensAndroid.indexOf(token);

  if (idx === -1) {
    // It is necessary to ensure dupe tokens absence
    logger.info(`[ID ${req.tokenStorage.accountId}]`, 'Binding new Android token:', token);
    req.tokenStorage.deviceTokensAndroid.push(token);
    return req.tokenStorage.save()
      .then(() => res.json({}))
      .catch((err) => {
        logger.error(`[ID ${req.tokenStorage.accountId}]`, 'Binding new Android token failed:', err.message);
        res.status(400).send('Improper Device Token');
      });
  }

  res.json({});
};

exports.getAndroidTokenList = function(req, res) {
  res.json(req.tokenStorage.deviceTokensAndroid);
};
