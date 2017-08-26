'use strict';

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');

const config = require('../../config.json');
const env = require('../../../../env');

const semaphorize = require('./semaphorize');

const balance = require('./balance');
const inventory = require('./inventory');
const equipmentSchema = require('./equipment-schema');
const itemSchema = require('./item-schema');

const accountSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  exp: { type: Number, default: 0 },
  bp: { type: Number, default: 0 },
  balanceGold: { type: Number, default: 0 },
  balanceGems: { type: Number, default: 0 },
  userEmail: String,
  userPassword: String,
  inventory: [ itemSchema ],
  equipment: { type: equipmentSchema },
  capacity: { type: Number, default: env('ACCOUNTS_STARTING_CAPACITY') },
  artifactCellsUnlocked: { type: Number, default: 4 },
  orderCellsUnlocked: { type: Number, default: 5 }
});

accountSchema.plugin(autoIncrement.plugin, {
  model: 'Account',
  field: 'id'
});
accountSchema.plugin(timestamp);
accountSchema.plugin(semaphorize, {
  timeout: config['ACCOUNTS_SEMAPHORE_TIMEOUT'],
  retryInterval: config['ACCOUNTS_SEMAPHORE_CHECK_INTERVAL']
});

accountSchema.set('toObject', { virtuals: true });
accountSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret._lock;
    delete ret._now;

    if (ret.userEmail) { delete ret.userEmail; }
    if (ret.userPassword) { delete ret.userPassword; }

    ret.inventory.forEach((item) => {
      delete item._id;
    });

    if (ret.equipment) {
      delete ret.equipment._id;

      Object.keys(ret.equipment).forEach((key) => {
        const value = ret.equipment[key];

        if (value._id) {
          delete value._id;
        }
      });

      if (ret.equipment.artifacts) {
        const newArtifacts = [];
        for (let i = 0; i < ret.artifactCellsUnlocked; i++) {
          newArtifacts.push({});
        }

        ret.equipment.artifacts.forEach((artifact) => {
          delete artifact.item._id;
          newArtifacts[artifact.cellIdx] = artifact.item;
        });

        ret.equipment.artifacts = newArtifacts;
      }
    }

    return ret;
  }
});

accountSchema.virtual('level').get(function() {
  return Math.floor(
    config['ACCOUNT_LEVEL_POLYNOMIAL'][0] +
    config['ACCOUNT_LEVEL_POLYNOMIAL'][1]*Math.pow(this.exp, 1/2) +
    config['ACCOUNT_LEVEL_POLYNOMIAL'][2]*Math.pow(this.exp, 1/3) +
    config['ACCOUNT_LEVEL_POLYNOMIAL'][3]*Math.pow(this.exp, 1/4)
  );
});

accountSchema.statics.incGold = balance.incGold;
accountSchema.statics.incGems = balance.incGems;
accountSchema.statics.expandOrderCells = balance.expandOrderCells;

accountSchema.methods.addItems = inventory.addItems;
accountSchema.methods.removeItems = inventory.removeItems;
accountSchema.methods.equip = inventory.equip;
accountSchema.methods.unequip = inventory.unequip;
accountSchema.methods.equipArtifact = inventory.equipArtifact;
accountSchema.methods.unequipArtifact = inventory.unequipArtifact;

module.exports = mongoose.model('Account', accountSchema);
