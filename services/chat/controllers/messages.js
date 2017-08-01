'use strict';

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
  req.room.sendMessage(req.body);
  res.json({});
};
