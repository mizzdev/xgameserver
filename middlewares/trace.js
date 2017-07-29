'use strict';

module.exports = function(req, res, next) {
  console.log(req.path);
  console.log(req.headers);
  console.log(req.params);
  console.log(req.query);
  console.log(req.body);

  next();
};
