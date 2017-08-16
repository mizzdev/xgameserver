'use strict';

const should = require('should');

module.exports = function semaphorizePlugin(schema, options) {
  let timeout = 0;

  if (options && options.timeout) {
    timeout = options.timeout;
  }

  schema.add({ _lock: Date });
  schema.add({ _now: Date });

  schema.statics.lock = function(id) {
    return this.findOneAndUpdate(
      { id },
      { $currentDate: { _now: true } },
      { new: true }
    )
      .then((entity) => {
        should.exist(entity, 'Entity not found');

        let query = {
          id: id,
          $or: [
            { _lock: { $exists: false } },
            { _lock: { $lt: new Date((timeout) ? (entity._now - timeout) : 0) } }
          ]
        };

        return this.update(
          query,
          { $currentDate: { _lock: true } }
        );
      })
      .then((result) => Boolean(result.n));
  };

  schema.statics.unlock = function(id) {
    return this.update({ id }, { $unset: { _lock: '' } })
      .then((result) => Boolean(result.n));
  };
};
