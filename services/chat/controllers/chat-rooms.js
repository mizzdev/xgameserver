'use strict';

const roomManager = require('../room-manager');
const config = require('../config.json');

function getPlayers(room) {
  return room.readsPerSecond*config['CHAT_ROOM_UPDATE_RATE'];
}

function getAll(req, res) {
  const roomList = roomManager.getRoomList();
  const result = {};

  roomList.forEach((room) => {
    result[room.name] = getPlayers(room);
  });

  res.json(result);
}

function getAuto(req, res) {
  const langRule = config['CHAT_LANG_RULES'][req.query.lang];
  const roomName = langRule || config['CHAT_LANG_DEFAULT'];

  const room = roomManager.resolve(roomName);
  const result = {};
  result[room.name] = getPlayers(room);

  res.json(result);
}

exports.getList = function(req, res) {
  if (req.query.lang) {
    return getAuto(req, res);
  }

  getAll(req, res);
};
