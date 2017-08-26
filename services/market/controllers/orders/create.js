'use strict';

module.exports = function(api) {
  return function(req, res, next) {
    const order = {
      ownerId: req.account.id,
      ownerNickname: req.account.nickname,
      item: req.body.item,
      cost: req.body.cost,
      currency: req.body.currency
    };

    api.orders.create(order, req.account.orderCellsUnlocked)
      .then(() => res.json({}))
      .catch((err) => {
        const capitalize = (str) => str.replace(/\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

        switch (err.name) {
        case 'AssertionError':
          return res.status(400).send(capitalize(err.message));
        case 'ValidationError':
          return res.status(400).send('Order Validation Error');
        default:
          return next(err);
        }
      });
  };
};
