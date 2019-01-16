const url = require('url');
const CMSAPI = require('./cms_api');
const config = require('../config');

const urlParse = url.parse(config.get('threeScale.portalEndpoint'));
const accessToken = urlParse.auth;
urlParse.auth = null;

module.exports = new CMSAPI(urlParse.format(), accessToken);
