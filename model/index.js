const Section = require('./section');
const Layout = require('./layout');
const File = require('./file');
const Partial = require('./partial');
const BuiltinPage = require('./builtin_page');


module.exports.File = new File();
module.exports.Layout = new Layout();
module.exports.Section = new Section();
module.exports.Partial = new Partial();
module.exports.BuiltinPage = new BuiltinPage();
