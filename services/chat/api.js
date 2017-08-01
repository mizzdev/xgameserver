'use strict';

const Promise = require('bluebird');
const roomManager = require('./room-manager');
const config = require('./config.json');

exports.getRoomList = function() {
  return Promise.resolve(roomManager.getRoomList())
    .then((rooms) => {
      const roomLabels = rooms
        .map((room) => room.label)
        .filter((label, idx, self) => (idx === self.indexOf(label)));

      const roomList = roomLabels.map((label) => {
        const item = {};

        item.label = label;
        item.rooms = rooms.filter((room) => (room.label === label)).map((room) => {
          return {
            name: room.name,
            players: Math.round(room.readsPerSecond*config['CHAT_ROOM_UPDATE_RATE']/1000)
          };
        });

        return item;
      });

      return roomList;
    });
};

exports.createRoom = function(roomLabel) {
  return Promise.resolve()
    .then(() => {
      roomManager.createRoom(roomLabel);
    });
};

exports.deleteRoom = function(roomLabel) {
  return Promise.resolve()
    .then(() => {
      roomManager.deleteRoom(roomLabel);
    });
};