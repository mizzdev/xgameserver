'use strict';

const serviceRegistry = require('../../registry');

exports.overview = function(req, res) {
  const chatService = serviceRegistry.getService('chat');

  chatService.getRoomList()
    .then((rooms) => { res.locals.rooms = rooms; })
    .then(() => res.render('chat'));
};
