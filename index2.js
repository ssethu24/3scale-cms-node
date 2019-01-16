const flush = require('./flush');
const upload = require('./uploadv2');
// const download = require('./download');
const config = require('./config');

const WRK_DIR = config.get('contentRootPath');
const action = 'flush';


flush();
upload(WRK_DIR);


