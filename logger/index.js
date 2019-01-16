const commonLogger = require('common-logger');
const config = require('../config');

let loggerOpts = {
  bunyan: {
    name: '3scale-cms-uploader',
    environment: config.get('env'),
  },
  hookUncaught: true,
};

module.exports = commonLogger.createLogger(loggerOpts);
