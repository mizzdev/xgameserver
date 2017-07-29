'use strict';

const log4js = require('log4js');
const DashboardUser = require('./models/dashboard-user');
const config = require('./config.json');

const logger = log4js.getLogger('dashboard');

DashboardUser.count()
  .then((count) => {
    if (count) {
      return;
    }

    const user = new DashboardUser({
      username: config['DASHBOARD_DEFAULT_USERNAME'],
      password: config['DASHBOARD_DEFAULT_PASSWORD']
    });

    return user.save()
      .then((user) => {
        logger.info('Created default admin record with credentials:');
        logger.info('Username:', user.username);
        logger.info('Password:', user.password);
        logger.warn('Please, change the default credentials ASAP!');
      });
  });
