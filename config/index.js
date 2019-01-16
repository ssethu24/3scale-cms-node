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
      default: 'https://3scale-uat13-admin.uat.bluescape.com',
      env: 'THREESCALE_ADMIN_ENDPOINT',
    },
    accessToken: {
      format: 'String',
      default: '35aa72cd8f9907e018a1d3f4d0818d9ca03d8e4dabfa719ea6df3ed27cfd3f94',
      env: 'THREESCALE_ACCESS_TOKEN',
    },
  },
});


config.validate({ allowed: 'strict' });
module.exports = config;
