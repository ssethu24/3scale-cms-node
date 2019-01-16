const CMSAPI = require('./cms_api');
const config = require('../config');


module.exports = new CMSAPI(config.get('threeScale.portalEndpoint'), config.get('threeScale.accessToken'));
