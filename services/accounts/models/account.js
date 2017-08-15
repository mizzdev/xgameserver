'use strict';

const should = require('should');
const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');

const itemTables = require('../item-tables');
const config = require('../config.json');

const itemSchema = new mongoose.Schema({
  itemId: { type: Number, required: true },
  level: { type: Number, min: 1 },
  quantity: { type: Number, min: 1, default: 1 }
});

const accountSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  exp: { type: Number, default: 0 },
  bp: { type: Number, default: 0 },
  balanceGold: { type: Number, default: 0 },
  balanceGems: { type: Number, default: 0 },
  userEmail: String,
  userPassword: String,
  inventory: [ itemSchema ],
  capacity: { type: Number, default: config['ACCOUNTS_STARTING_CAPACITY'] },
  _lock: Date, // Semaphore lock timestamp (one needs this to perform certain complex operations atomically)
  _now: Date // Current db timestamp
});

accountSchema.plugin(autoIncrement.plugin, {
  model: 'Account',
  field: 'id'
});
accountSchema.plugin(timestamp);

accountSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret._lock;
    delete ret._now;

    if (ret.userEmail) { delete ret.userEmail; }
    if (ret.userPassword) { delete ret.userPassword; }

    return ret;
  }
});

accountSchema.statics.lock = function(accountId) {
  return this.findOneAndUpdate(
    { id: accountId },
    { $currentDate: { _now: true } },
    { new: true }
  )
    .then((account) => {
      should.exist(account, 'Account not found');

      let query = {
        id: accountId,
        $or: [
          { _lock: { $exists: false } },
          { _lock: { $lt: new Date(account._now - config['ACCOUNT_SEMAPHORE_TIMEOUT']) } }
        ]
      };

      return this.update(
        query,
        { $currentDate: { _lock: true } }
      );
    })
    .then((result) => Boolean(result.n));
};

accountSchema.statics.unlock = function(accountId) {
  return this.update({ id: accountId }, { $unset: { _lock: '' } })
    .then((result) => Boolean(result.n));
};

accountSchema.methods.addItem = function(item) {
  should(item.itemId).be.a.Number();
  should(item.level).be.a.Number();
  should(item.quantity).be.a.Number();
  should(item.quantity).be.greaterThan(0);

  const stackSize = itemTables.stackSize(item.itemId);

  const existingItem = this.inventory.find((inventoryItem) => {
    return (
      (inventoryItem.itemId === item.itemId) &&
      (inventoryItem.level === item.level) &&
      (inventoryItem.quantity < stackSize)
    );
  });

  const existingQuantity = (existingItem) ? Math.min(item.quantity, stackSize - existingItem.quantity) : 0;
  const fullCellsNeeded = Math.floor((item.quantity - existingQuantity) / stackSize);
  const residualQuantity = item.quantity - existingQuantity - fullCellsNeeded * stackSize;
  const cellsNeeded = (residualQuantity) ? (fullCellsNeeded + 1) : fullCellsNeeded;

  should(cellsNeeded).be.belowOrEqual(this.capacity - this.inventory.length, 'Not enough space');

  if (existingItem) {
    existingItem.quantity += existingQuantity;
  }

  const cellsToAppend = Array.apply(null, Array(cellsNeeded)).map(() => {});
  cellsToAppend.forEach((_, idx) => {
    const appendQuantity = (idx < fullCellsNeeded) ? stackSize : residualQuantity;
    this.inventory.push({
      itemId: item.itemId,
      level: item.level,
      quantity: appendQuantity
    });
  });

  return this.update({ $set: { inventory: this.inventory } });
};

accountSchema.methods.removeItem = function(item) {
  should(item.itemId).be.a.Number();
  should(item.level).be.a.Number();
  should(item.quantity).be.a.Number();
  should(item.quantity).be.greaterThan(0);

  const cellsMatching = this.inventory.filter((inventoryItem) => {
    return (
      (inventoryItem.itemId === item.itemId) &&
      (inventoryItem.level === item.level)
    );
  }).reverse();

  const availableQuantity = cellsMatching.reduce((memo, inventoryItem) => {
    return memo + inventoryItem.quantity;
  }, 0);

  should(availableQuantity).be.aboveOrEqual(item.quantity, 'Not enough items');

  let quantityLeft = item.quantity;

  cellsMatching.forEach((inventoryItem) => {
    if (!quantityLeft) {
      return;
    }

    const residualQuantity = Math.min(quantityLeft, inventoryItem.quantity);

    inventoryItem.quantity -= residualQuantity;
    quantityLeft -= residualQuantity;

    if (!inventoryItem.quantity) {
      return this.inventory.splice(this.inventory.indexOf(inventoryItem), 1);
    }
  });

  return this.update({ $set: { inventory: this.inventory } });
};

module.exports = mongoose.model('Account', accountSchema);
