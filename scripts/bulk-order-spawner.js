'use strict';

const log4js = require('log4js');
const PQueue = require('p-queue');
const should = require('should');
const argv = require('minimist')(process.argv.slice(2));

const env = require('../env');
const db = require('../db');

db.init(env('MONGO_URL'));

const Order = require('../services/market/models/order');

const logger = log4js.getLogger('bulk-order-spawner');

const concurrency = argv.concurrency || argv.c || 1;
const verbose = argv.verbose || argv.v || false;
const accountId = argv['account-id'] || argv.I;
const accountNickname = argv['account-nickname'] || argv.N;
const n = argv.number || argv.n || 1;
const cost = argv.cost || 1;
const currency = argv.currency || 'gold';
const itemId = argv['item-id'] || argv.i;
const level = argv['item-level'] || argv.l || 1;
const quantity = argv['item-quantity'] || argv.q || 1;
const minLevel = argv['min-level'] || argv.m || 1;

should.exist(accountId, 'No account ID specified, use --account-id or -I');
should.exist(accountNickname, 'No account nickname specified, use --account-nickname or -N');
should.exist(itemId, 'No item ID specified, use --item-id or -i');

logger.level = 'info';
if (verbose) {
  logger.level = 'debug';
}

const orderCreationQueue = new PQueue({ concurrency });
const item = { itemId, level, quantity };

function orderCreationTask(i) {
  const order = new Order({
    ownerId: accountId,
    ownerNickname: accountNickname,
    item, cost, currency, minLevel
  });

  return order.save()
    .then((order) => logger.debug(`Spawned order ID ${order.id}`, `(${i})`));
}

logger.info('Current environment:', env('NODE_ENV') || 'dev');

for (let i = 0; i < n; i++) {
  orderCreationQueue.add(orderCreationTask.bind(null, i));
}

orderCreationQueue.onEmpty().then(() => {
  logger.info('Finished spawning orders!');
  setTimeout(() => process.exit(0), 0);
});
