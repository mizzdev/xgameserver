'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('accounts');

exports.create = function(req, res) {
  const token  = req.body.token;

  if (!token) {
    return res.status(400).send('Improper Device Token');
  }

  const idx = req.account.deviceTokensAndroid.indexOf(token);

  if (idx === -1) {
    // It is necessary to ensure dupe tokens absence
    logger.info(`[ID ${req.account.id}]`, 'Binding new Android token:', token);
    req.account.deviceTokensAndroid.push(token);
    return req.account.save()
      .then(() => res.json({}))
      .catch((err) => {
        logger.error(`[ID ${req.account.id}]`, 'Binding new Android token failed:', err.message);
        res.status(400).send('Improper Device Token');
      });
  }

  res.json({});
};

exports.getList = function(req, res) {
  res.json(req.account.deviceTokensAndroid);
};
