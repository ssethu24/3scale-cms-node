const flush = require('./flush');
const upload = require('./uploadv2');
// const download = require('./download');
const config = require('./config');

const WRK_DIR = config.get('contentRootPath');
const action = 'flush';


async function asyncInit() {
  await flush();
  await upload(WRK_DIR);
}

asyncInit().then(() => {
  console.log("completed")
})
