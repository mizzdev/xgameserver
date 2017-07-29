'use strict';

const roomManager = require('../room-manager');

exports.getList = function(req, res) {
  const last  = Number(req.query.last) || -1;
  const room = roomManager.resolve(req.params.roomName);
  const messageList = room.readMessages(last);

  res.json({
    messages: messageList.map((message) => JSON.stringify(message)),
    last: room.msgCounter - 1
  });
};

exports.send = function(req, res) {
  const last  = Number(req.query.last) || -1;
  const room = roomManager.resolve(req.params.roomName);
  room.sendMessage(req.body);

  const messageList = room.readMessages(last);

  res.json({
    messages: messageList.map((message) => JSON.stringify(message)),
    last: room.msgCounter - 1
  });
};
