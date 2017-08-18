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

exports.equip = function(cellIdx) {
  should(cellIdx).be.a.Number();
  should(cellIdx).be.lessThan(this.inventory.length);

  const item = this.inventory[cellIdx];
  const itemType = itemTables.getProps(item.itemId).itemType || 'none';
  const equipWhitelist = itemTables.getEquipWhitelist();

  should(equipWhitelist).containEql(itemType);

  if (!this.equipment) {
    this.equipment = {};
  }

  const equippedItem = this.equipment[itemType];

  if (equippedItem) {
    this.inventory.push(equippedItem);
  }

  this.equipment[itemType] = item;
  this.inventory.splice(cellIdx, 1);

  return this.save();
};

exports.unequip = function(bodyPart) {
  should(bodyPart).be.a.String();

  const equipWhitelist = itemTables.getEquipWhitelist();

  should(equipWhitelist).containEql(bodyPart);
  should.exist(this.equipment);

  const equippedItem = this.equipment[bodyPart];
  should.exist(equippedItem);

  const update = { $unset: {} };
  update.$unset['equipment.'+bodyPart] = '';

  update.$push = { inventory: equippedItem };

  return this.update(update);
};
