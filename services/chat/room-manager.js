'use strict';

const log4js = require('log4js');
const Room = require('./room');
const config = require('./config.json');

const logger = log4js.getLogger('chat');
logger.level = 'debug';

const roomList = [];

function update() {
  roomList.forEach((room) => room.update());
}

exports.createRoom = function(roomLabel) {
  const similarRoomsCount = roomList
    .filter((room) => (room.label === roomLabel)).length;

  const room = new Room(
    `${roomLabel}${similarRoomsCount + 1}`,
    roomLabel,
    config['CHAT_ROOM_CAPACITY']
  );

  roomList.push(room);

  logger.info(`Created room named "${room.name}"`);
  return room;
};

exports.deleteRoom = function(roomLabel) {
  const similarRooms = roomList
    .filter((room) => (room.label === roomLabel));
  const similarRoomsCount = similarRooms.length;

  if (!similarRoomsCount) {
    throw new Error('Nothing to delete');
  }

  roomList.splice(roomList.indexOf(similarRooms[similarRoomsCount - 1]), 1);
};


exports.resolve = function(roomLabel) {
  const similarRooms = roomList
    .filter((room) => (room.label === roomLabel))
    .sort((a, b) => (a.readsPerSecond - b.readsPerSecond));
  const similarRoomsCount = similarRooms.length;

  const room = (similarRoomsCount) ?
    similarRooms[0] : exports.createRoom(roomLabel);

  logger.debug(`Resolved room named "${room.name}"`);
  return room;
};

exports.getRoom = function(roomName) {
  return roomList.find((room) => (room.name === roomName));
};

exports.getRoomList = function() {
  return roomList;
};

setInterval(update, config['CHAT_ROOM_UPDATE_RATE']);
