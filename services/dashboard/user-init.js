'use strict';

const log4js = require('log4js');
const DashboardUser = require('./models/dashboard-user');
const env = require('../../env');

const logger = log4js.getLogger('dashboard');

DashboardUser.count()
  .then((count) => {
    if (count) {
      return;
    }

    const user = new DashboardUser({
      username: env('DASHBOARD_DEFAULT_USERNAME'),
      password: env('DASHBOARD_DEFAULT_PASSWORD'),
      defaultCredentials: true
    });

    return user.save()
      .then(() => {
        logger.info('Created default admin record with default credentials');
        logger.info('Look into your environment configuration file for details');
        logger.warn('Please, change the default credentials ASAP!');
      });
  });
