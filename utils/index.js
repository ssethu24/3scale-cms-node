const { CONTENT_TYPE_MAPPING_REV } = require('./contants');


module.exports.getFileExt = (contentType) => {
  if (contentType && CONTENT_TYPE_MAPPING_REV[contentType.toLowerCase()]) {
    return CONTENT_TYPE_MAPPING_REV[contentType.toLowerCase()];
  }
  return 'html';
};
