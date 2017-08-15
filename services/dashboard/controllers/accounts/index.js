'use strict';

const moment = require('moment');
const serviceRegistry = require('../../../registry');

function formatDate(date) {
  return moment(date).format('DD.MM.YYYY HH:mm:ss');
}

exports.overview = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');

  accountsService.getCount()
    .then((count) => { res.locals.players = count; })
    .then(() => accountsService.getViolatorList())
    .then((violators) => violators.map((violator) => {
      violator.first = '';
      violator.last = '';

      const precedents = violator.violations.length;
      violator.precedents = precedents;

      if (precedents) {
        violator.first = formatDate(violator.violations[0].createdAt);
        violator.last = formatDate(violator.violations[precedents - 1].createdAt);
      }

      return violator;
    }))
    .then((violators) => { res.locals.violators = violators; })
    .then(() => res.render('accounts/index'));
};

exports.addItem = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');

  const item = {
    itemId: Number(req.body.itemId),
    level: Number(req.body.level),
    quantity: Number(req.body.quantity)
  };

  accountsService.addItem(req.body.target, item)
    .then((result) => res.locals.result = result)
    .catch((err) => res.locals.error = err.message)
    .finally(() => res.render('accounts/item-modal'));
};

exports.removeItem = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');

  const item = {
    itemId: Number(req.body.itemId),
    level: Number(req.body.level),
    quantity: Number(req.body.quantity)
  };

  accountsService.removeItem(req.body.target, item)
    .then((result) => res.locals.result = result)
    .catch((err) => res.locals.error = err.message)
    .finally(() => res.render('accounts/item-modal'));
};

exports.ban = function(req, res) {
  const authService = serviceRegistry.getService('auth');

  authService.ban(req.params.id || req.body.target, Number(req.body.duration) || (31557600 * 100))
    .then(() => res.redirect(req.app.locals.rootPath+'/auth'));
};
