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
  _lock: Date, // Semaphore lock timestamp (one needs this to perform certain complex operations atomically)
  _now: Date // Current db timestamp
});

accountSchema.plugin(autoIncrement.plugin, {
  model: 'Account',
  field: 'id'
});
accountSchema.plugin(timestamp);
accountSchema.plugin(semaphorize, { timeout: config['ACCOUNTS_SEMAPHORE_TIMEOUT'] });

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
        ret.equipment.artifacts.forEach((artifact, idx) => {
          if (!artifact) {
            ret.equipment.artifacts[idx] = artifact = {};
          }

          if (artifact._id) {
            delete artifact._id;
          }
        });
      }
    }

    return ret;
  }
});

accountSchema.statics.incGold = balance.incGold;
accountSchema.statics.incGems = balance.incGems;

accountSchema.methods.addItems = inventory.addItems;
accountSchema.methods.removeItems = inventory.removeItems;
accountSchema.methods.equip = inventory.equip;
accountSchema.methods.unequip = inventory.unequip;
accountSchema.methods.equipArtifact = inventory.equipArtifact;
accountSchema.methods.unequipArtifact = inventory.unequipArtifact;

module.exports = mongoose.model('Account', accountSchema);
