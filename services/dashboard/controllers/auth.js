'use strict';

const moment = require('moment');
const serviceRegistry = require('../../registry');

function formatDate(date) {
  return moment(date).format('DD.MM.YYYY HH:mm:ss');
}

exports.overview = function(req, res) {
  const authService = serviceRegistry.getService('auth');

  authService.getBanlist()
    .then((banlist) => banlist.map((record) => {
      record = record.toObject();

      record.createdAt = formatDate(record.createdAt);
      record.updatedAt = formatDate(record.updatedAt);
      record.expiry = formatDate(record.expiry);

      return record;
    }))
    .then((banlist) => { res.locals.banlist = banlist; })
    .then(() => res.render('auth'));
};

exports.unban = function(req, res) {
  const authService = serviceRegistry.getService('auth');

  authService.unban(req.params.id || req.body.target)
    .then(() => res.redirect(req.app.locals.rootPath+'/auth'));
};
