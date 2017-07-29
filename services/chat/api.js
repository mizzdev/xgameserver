'use strict';

const Promise = require('bluebird');
const roomManager = require('./room-manager');
const config = require('./config.json');

exports.getRoomList = function() {
  return Promise.resolve(roomManager.getRoomList())
    .then((rooms) => {
      return rooms.map((room) => {
        return {
          name: room.name,
          players: room.readsPerSecond*config['CHAT_ROOM_UPDATE_RATE']
        };
      });
    });
};
