const fs = require('fs');
const path = require('path');
const { CONTENT_TYPE_MAPPING_REV } = require('./contants');


module.exports.getFileExt = (contentType) => {
  if (contentType && CONTENT_TYPE_MAPPING_REV[contentType.toLowerCase()]) {
    return CONTENT_TYPE_MAPPING_REV[contentType.toLowerCase()];
  }
  return 'html';
};


const getMetaFileLocation = (dir) => {
  let fileList = [];
  fs.readdirSync(dir).forEach(file => {
    if (fs.statSync(path.join(dir, file)).isFile() && file === '.meta.json') {
      fileList.push(path.join(dir, file))
    } else {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        const recFileList = getMetaFileLocation(path.join(dir, file));
        fileList = fileList.concat(recFileList);
      }
    }
  });
  return fileList;
};
module.exports.getMetaFileLocation = getMetaFileLocation;
