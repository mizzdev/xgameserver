'use strict';

const log4js = require('log4js');
const morgan = require('morgan');

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'logs/x-gs.log', maxLogSize: 10485760, backups: 10, }
  },
  categories: {
    default: { appenders: [ 'out', 'app' ], level: 'debug' }
  },
  pm2: true
});

const logger = log4js.getLogger('X-GS');

logger.level = 'debug';
logger.info('---WELCOME!---');

const express = require('express');
const bodyParser = require('body-parser');

const env = require('./env');
const db = require('./db');
const serviceRegistry = require('./services/registry');

const app = express();

if (env('SERVER_LOG_HTTP')) {
  app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.listen(env('PORT'));

db.init(env('MONGO_URL'));

serviceRegistry.provideRouter(app);
serviceRegistry.addService(require('./services/auth'));
serviceRegistry.addService(require('./services/accounts'));
serviceRegistry.addService(require('./services/chat'));
serviceRegistry.addService(require('./services/notifications'));
serviceRegistry.addService(require('./services/dashboard'));
serviceRegistry.addService(require('./services/apns'));
serviceRegistry.addService(require('./services/gcm'));
serviceRegistry.addService(require('./services/market'));

app.use('*', (req, res) => {
  res.status(404).send('Endpoint Not Found');
});
app.use(function(err, req, res, next) {
  logger.error('Unhandled Error');
  logger.error(err.stack);

  res.status(500).send('Internal Server Error');
});
