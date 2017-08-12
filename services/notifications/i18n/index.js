'use strict';

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

const logger = log4js.getLogger('notifications');

const langData = {};

const normalizedPath = path.join(__dirname, 'lang');

if (fs.existsSync(normalizedPath)) {
  const files = fs.readdirSync(path.join(__dirname, 'lang'));

  if (!files.length) {
    logger.warn('There are no language files in ./i18n/lang folder yet. Maybe you should add some?');
  }

  files.forEach((file) => {
    const lang = file.split('.')[0];

    langData[lang] = require('./lang/' + file);
    logger.debug(`Loaded language file for "${lang}" from ${file}`);
  });
} else {
  logger.warn('There is no ./i18n/lang folder yet. You are adviced to create one so that you can load your language files');
}

function interpolate(message, lang, interpolation) {
  return message
    .split('#' + interpolation)
    .join(getInterpolatedValue(lang, interpolation));
}

function getInterpolatedValue(lang, interpolation) {
  if (!langData[lang]) {
    return getInterpolatedValueDefault(interpolation);
  }

  const interpolatedValue = langData[lang][interpolation];

  if (!interpolatedValue) {
    return getInterpolatedValueDefault(interpolation);
  }

  return interpolatedValue;
}

function getInterpolatedValueDefault(interpolation) {
  if (!langData['en']) {
    return interpolation;
  }

  const interpolatedValue = langData['en'][interpolation];

  if (!interpolatedValue) {
    return interpolation;
  }

  return interpolatedValue;
}

function getInterpolations(message) {
  message = ' ' + message;

  const interpParts = message.split('#');
  interpParts.shift();

  return interpParts.map((interp) => {
    const spaceIdx = interp.indexOf(' ');

    if (spaceIdx === -1) {
      return interp;
    }

    return interp.substr(0, spaceIdx);
  });
}

module.exports = function parse(message, lang) {
  message = message
    .split('\\#')
    .join('&hash;');

  const interpolations = getInterpolations(message);

  interpolations.forEach((interpolation) => {
    message = interpolate(message, lang, interpolation);
  });

  message = message
    .split('&hash;')
    .join('#');

  return message;
};
