'use strict';

const roomManager = require('../room-manager');

exports.getList = function(req, res) {
  const last  = Number(req.query.last) || -1;
  const room = roomManager.getRoom(req.params.roomName);
  const messageList = room.readMessages(last);

  if (!room) {
    return res.status(404).send('Room Not Found');
  }

  res.json({
    messages: messageList.map((message) => JSON.stringify(message)),
    last: room.msgCounter - 1
  });
};

exports.send = function(req, res) {
  const last  = Number(req.query.last) || -1;
  const room = roomManager.getRoom(req.params.roomName);

  if (!room) {
    return res.status(404).send('Room Not Found');
  }

  room.sendMessage(req.body);

  const messageList = room.readMessages(last);

  res.json({
    messages: messageList.map((message) => JSON.stringify(message)),
    last: room.msgCounter - 1
  });
};
