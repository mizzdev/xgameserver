'use strict';

const mongoose = require('mongoose');
const itemSchema = require('./item-schema');

const artifactSchema = new mongoose.Schema({
  cellIdx: { type: Number, required: true, min: 0 },
  item: { type: itemSchema }
});

module.exports = new mongoose.Schema({
  melee: { type: itemSchema },
  gun: { type: itemSchema },
  hat: { type: itemSchema },
  lens: { type: itemSchema },
  skin: { type: itemSchema },
  shoes: { type: itemSchema },
  artifacts: [ artifactSchema ]
});
