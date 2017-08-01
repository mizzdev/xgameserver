'use strict';

const MuteRecord = require('../models/mute-record');
const config = require('../config.json');

exports.getList = function(req, res) {
  let last;

  if (typeof req.query.last === 'undefined') {
    last = -1;
  } else {
    last = Number(req.query.last);
  }

  const messageList = req.room.readMessages(last);

  res.json({
    messages: messageList,
    last: req.room.msgCounter - 1
  });
};

exports.send = function(req, res) {
  MuteRecord.getStatus(req.accountId)
    .then((status) => {
      if (status.muted) {
        const expiresIn = Number(status.expiry - Date.now());
        return res.status(400).send(`You Are Muted For ${expiresIn}`);
      }

      req.room.sendMessage(req.body);
      MuteRecord.mute(req.accountId, config['CHAT_RATE_LIMIT'])
        .then(() => res.json({}));
    });
};
