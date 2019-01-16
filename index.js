const flush = require('./flush');
const upload = require('./upload');
// const download = require('./download');
const config = require('./config');
const logger = require('./logger');

const WRK_DIR = config.get('contentRootPath');


async function asyncInit() {
  await flush();
  await upload(WRK_DIR);
}


asyncInit().then(() => {
  logger.info("CMS content Uploaded Successfully")
});

