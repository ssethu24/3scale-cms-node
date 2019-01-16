const _ = require('lodash');

module.exports = class File {
  constructor(files) {
    this.files = [];
    this.PATH = {};
    this.ID = {};
    this.triggerMap();
    this.load(Array.isArray(files) ? files : [])
  }

  load(files) {
    if (Array.isArray(files) && !_.isEmpty(files)) {
      this.files = files.filter(file => file._type = 'file');
      this.triggerMap();
    }
  }

  triggerMap() {
    this.PATH = _.keyBy(this.files, 'path');
    this.ID = _.keyBy(this.files, 'id');
  }

  getById(id) {
    return this.ID[id] ? this.ID[id] : null;
  }

  addOrUpdate(file) {
    if (this.ID[file.id]) {
      const index = this.files.findIndex(item => item.id === file.id);
      this.files[index] = file;
    } else {
      this.files.push(file);
    }
    this.ID[file.id] = file;
    this.PATH[file.path] = file;
  }

  //Key should be id or path
  deleteByKey(key) {
    const item = this.ID[key] || this.PATH[key];
    if (item) {
      delete this.ID[item.id];
      delete this.PATH[item.path];
      const index = this.files.findIndex(file => item.id === file.id);
      delete this.files[index];
    }
  }

  getByPath(name) {
    return this.PATH[name] ? this.PATH[name] : null;
  }
};
