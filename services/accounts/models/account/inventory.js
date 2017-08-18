'use strict';

const should = require('should');
const itemTables = require('../../item-tables');

function addItem(item) {
  should(item.itemId).be.a.Number();
  should(item.level).be.a.Number();
  should(item.quantity).be.a.Number();
  should(item.quantity).be.greaterThan(0);

  const stackSize = itemTables.getProps(item.itemId).stackSize || 1;

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
}

function removeItem(item) {
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
}

exports.addItems = function(items) {
  should(items).be.an.Array();

  items.forEach((item) => addItem.call(this, item));
  return this.update({ $set: { inventory: this.inventory } });
};

exports.removeItems = function(items) {
  should(items).be.an.Array();

  items.forEach((item) => removeItem.call(this, item));
  return this.update({ $set: { inventory: this.inventory } });
};
