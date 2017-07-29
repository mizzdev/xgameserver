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

exports.createRoom = function(roomName) {
  const similarRoomsCount = roomList.filter((room) => {
    const idx = room.name.indexOf(roomName);
    return (idx > -1);
  }).length;

  const room = new Room(
    `${roomName}${similarRoomsCount + 1}`,
    config['CHAT_ROOM_CAPACITY']
  );

  roomList.push(room);

  logger.info(`Created room named "${room.name}"`);
  return room;
};

exports.resolve = function(roomName) {
  const similarRooms = roomList.filter((room) => {
    const idx = room.name.indexOf(roomName);
    return (idx > -1);
  }).sort((a, b) => (a.readsPerSecond - b.readsPerSecond));
  const similarRoomsCount = similarRooms.length;

  const room = (similarRoomsCount) ?
    similarRooms[0] : exports.createRoom(roomName);

  logger.debug(`Resolved room named "${room.name}"`);
  return room;
};

exports.getRoomList = function() {
  return roomList;
};

setInterval(update, config['CHAT_ROOM_UPDATE_RATE']);
