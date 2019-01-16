const _ = require('lodash');
const Base = require('./base');

module.exports = class element extends Base {
  constructor(elements) {
    super();
    this.elements = [];
    this.SN = {};
    this.ID = {};
    this.load(Array.isArray(elements) ? elements : [])
  }

  load(elements) {
    if (Array.isArray(elements) && !_.isEmpty(elements)) {
      this.elements = elements.filter(element => element._type = 'builtin_page');
      this.triggerMap();
    }
  }

  triggerMap() {
    this.SN = _.keyBy(this.elements, 'system_name');
    this.ID = _.keyBy(this.elements, 'id');
  }

  getById(id) {
    return this.ID[id] ? this.ID[id] : null;
  }

  addOrUpdate(element) {
    if (this.ID[element.id]) {
      const index = this.elements.findIndex(item => item.id === element.id);
      this.elements[index] = element;
    } else {
      this.elements.push(element);
    }
    this.ID[element.id] = element;
    this.SN[element.system_name] = element;
  }

  //Key should be id or sn
  deleteByKey(key) {
    const item = this.ID[key] || this.SN[key];
    if (item) {
      delete this.ID[item.id];
      delete this.SN[item.system_name];
      const index = this.elements.findIndex(element => item.id === element.id);
      delete this.elements[index];
    }
  }

  getBySystemName(name) {
    return this.SN[name] ? this.SN[name] : null;
  }
};
