const convict = require('convict');


const config = convict({
  env: {
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV',
  },
  contentRootPath: {
    format: 'String',
    default: '../api-portal-documentation',
    env: 'CONTENT_ROOT_PATH',
  },
  threeScale: {
    portalEndpoint: {
      format: 'String',
      default: 'https://74241fecd91f4df43fc177a2041cc6f3a2f2708c1cb13045fd8d865742ca2862@3scale-uat1-admin.uat.bluescape.com',
      env: 'THREESCALE_PORTAL_ENDPOINT',
    },
    accessToken: {
      format: 'String',
      default: '',
      env: 'THREESCALE_ACCESS_TOKEN',
    },
  },
});


config.validate({ allowed: 'strict' });
module.exports = config;
