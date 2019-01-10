const API = require('./api');



const api = new API('', '');


api.list('section').then((results) => {
  console.log(JSON.stringify(results));
});
