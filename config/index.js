const convict = require('convict');


const config = convict({
  env: {
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV',
  },
  threeScale: {
    portalEndpoint: {
      format: 'String',
      default: '',
      env: 'THREESCALE_ADMIN_ENDPOINT',
    },
    accessToken: {
      format: 'String',
      default: 'verification_key',
      env: 'THREESCALE_ACCESS_TOKEN',
    },
  },
});


config.validate({ allowed: 'strict' });
module.exports = config;
