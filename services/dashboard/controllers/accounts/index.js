'use strict';

const moment = require('moment');
const serviceRegistry = require('../../../registry');

function formatDate(date) {
  return moment(date).format('DD.MM.YYYY hh:mm:ss');
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
    .then(() => res.render('accounts'));
};

exports.getViolator = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');
  const accountId = req.params.id;

  accountsService.getViolator(accountId)
    .then();
};