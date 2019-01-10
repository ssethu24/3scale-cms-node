const API = require('./api');


const api = new API('https://3scale-uat11-admin.uat.bluescape.com', '45c6ce7deec4b96c742f0face34f125f');


api.list('section').then((results) => {
  console.log(JSON.stringify(results));
});

// api.createFile({ path: '/test/api.js',downloadable: 0, file_path: 'api.js', downloadable:false });
// api.updateFile({ id: '110', path: '/test/api.js', section_id: '204', file_path: 'api.js', downloadable: 1 });
// api.getFileById('110')
//   .then((res) => {
//     console.log(res)
//   })
// api.delete('file','108');
