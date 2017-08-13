'use strict';

const roomManager = require('../room-manager');

module.exports = function(req, res, next) {
  const room = roomManager.getRoom(req.params.room);

  if (!room) {
    return res.status(404).send('Room Not Found');
  }

  req.room = room;
  next();
};
