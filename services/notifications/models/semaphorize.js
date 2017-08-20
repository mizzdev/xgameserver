'use strict';

const Promise = require('bluebird');
const should = require('should');

module.exports = function semaphorizePlugin(schema, options) {
  let timeout = 0, retryInterval = 1000;

  if (options) {
    timeout = options.timeout || timeout;
    retryInterval = options.retryInterval || retryInterval;
  }

  schema.add({ _lock: Date });
  schema.add({ _now: Date });

  schema.statics.lock = function(id) {
    return this.findOneAndUpdate(
      { id },
      { $currentDate: { _now: true } },
      { new: true }
    )
      .then((doc) => {
        should.exist(doc, 'Document not found');

        let query = {
          id: id,
          $or: [
            { _lock: { $exists: false } },
            { _lock: { $lt: new Date((timeout) ? (doc._now - timeout) : 0) } }
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

  schema.methods.semaphorize = function(methodName, methodArguments, unlockOnSuccess) {
    unlockOnSuccess = (typeof unlockOnSuccess === 'undefined') ? true : unlockOnSuccess;

    return Promise.resolve()
      .then(() => {
        should(methodName).be.a.String();
        should(methodArguments).be.an.Array();
        should(this[methodName]).have.a.type('function', 'This document does not have such method');
      })
      .then(() => this.constructor.lock(this.id))
      .then((lockSuccess) => {
        if (!lockSuccess) {
          return Promise.delay(retryInterval)
            .then(this.semaphorize.bind(this, methodName, methodArguments, unlockOnSuccess));
        }

        const operation = this.constructor.findOne({ id: this.id })
          .then((doc) => doc[methodName].apply(this, methodArguments));

        if (unlockOnSuccess) {
          return operation.finally(() => this.constructor.unlock(this.id));
        } else {
          return operation.catch((err) => {
            return this.constructor.unlock(this.id).then(() => { throw err; });
          });
        }
      });
  };
};
