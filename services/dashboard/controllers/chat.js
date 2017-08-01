'use strict';

const serviceRegistry = require('../../registry');

exports.overview = function(req, res) {
  const chatService = serviceRegistry.getService('chat');

  chatService.getRoomList()
    .then((roomList) => { res.locals.roomList = roomList; })
    .then(() => res.render('chat'));
};

exports.expand = function(req, res) {
  const chatService = serviceRegistry.getService('chat');
  const roomLabel = req.body.label;

  if (!roomLabel) {
    return res.status(400).send('Room Label Is Not Specified');
  }

  chatService.createRoom(roomLabel)
  res.redirect(req.app.locals.rootPath+'/chat');
};

exports.shrink = function(req, res) {
  const chatService = serviceRegistry.getService('chat');
  const roomLabel = req.body.label;

  if (!roomLabel) {
    return res.status(400).send('Room Label Is Not Specified');
  }

  chatService.deleteRoom(roomLabel)
  res.redirect(req.app.locals.rootPath+'/chat');
};
