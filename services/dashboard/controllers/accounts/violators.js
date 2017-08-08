'use strict';

const moment = require('moment');
const serviceRegistry = require('../../../registry');

function formatDate(date) {
  return moment(date).format('DD.MM.YYYY HH:mm:ss');
}

exports.read = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');
  const accountId = req.params.id;

  accountsService.getViolator(accountId)
    .then((violator) => {
      if (!violator) {
        return res.status(404).send('Violator Record Not Found');
      }

      violator = violator.toObject();

      violator.first = '';
      violator.last = '';

      violator.violations = violator.violations.map((violation) => {
        violation.createdAt = formatDate(violation.createdAt);
        violation.updatedAt = formatDate(violation.updatedAt);

        return violation;
      });

      const precedents = violator.violations.length;
      violator.precedents = precedents;

      if (precedents) {
        violator.first = violator.violations[0].createdAt;
        violator.last = violator.violations[precedents - 1].createdAt;
      }

      res.locals.violator = violator;
      res.render('accounts/violator');
    });
};

exports.forgive = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');

  accountsService.forgiveViolator(req.params.id)
    .then(() => res.redirect(req.app.locals.rootPath+'/accounts'));
};
