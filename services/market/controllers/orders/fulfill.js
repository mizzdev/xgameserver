'use strict';

module.exports = function(api) {
  return function(req, res, next) {
    api.orders.fulfill(req.params.orderId, req.account.id, req.account.nickname)
      .then((order) => {
        if (!order) {
          return res.status(404).send('Order Not Found');
        }

        return res.json({});
      })
      .catch((err) => {
        const capitalize = (str) => str.replace(/\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

        switch (err.name) {
        case 'AssertionError':
          return res.status(400).send(capitalize(err.message));
        case 'ValidationError':
          return res.status(400).send('Order Fulfillment Validation Error');
        default:
          return next(err);
        }
      });
  };
};
