'use strict';

const config = require('../config.json');

function getAll(req, res) {
  res.json([ 'english1', 'english2', 'english3' ]);
}

function getAuto(req, res) {
  const langRule = config['CHAT_LANG_RULES'][req.query.lang];
  const label = langRule || config('CHAT_LANG_DEFAULT');

  res.json([ label + '1' ]);
}

exports.getList = function(req, res) {
  if (req.query.lang) {
    return getAuto(req, res);
  }

  getAll(req, res);
};
