'use strict';

const serviceRegistry = require('../../registry');

exports.overview = function(req, res) {
  const accountsService = serviceRegistry.getService('accounts');

  accountsService.getCount()
    .then((count) => { res.locals.players = count; })
    .then(() => res.render('accounts'));
};
