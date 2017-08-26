'use strict';

const serviceInterfaces = {};
let router;

exports.provideRouter = function(expressRouter) {
  if (router) {
    throw new Error('You have already provided a router for the registry');
  }

  router = expressRouter;
};

exports.addService = function(service) {
  if (!router) {
    throw new Error('Provide a router to the registry first');
  }

  if (typeof service === 'function') {
    service = service(exports);
  }

  const serviceName = service.name;

  if (serviceInterfaces[serviceName]) {
    throw new Error(`${serviceName} has already been registered`);
  }

  if (service.init) {
    service.init();
  }

  if (service.router) {
    router.use(`/${service.name}`, service.router);
  }

  serviceInterfaces[service.name] = service.serviceInterface;
};

exports.getService = function(serviceName) {
  const serviceInterface = serviceInterfaces[serviceName];

  if (!serviceInterface) {
    throw new Error(`${serviceName} has not been registered yet`);
  }

  return serviceInterface;
};
