const _ = require('lodash');

module.exports = class Layout {
  constructor(layouts) {
    this.layouts = [];
    this.SN = {};
    this.ID = {};
    this.triggerMap();
    this.load(Array.isArray(layouts) ? layouts : [])
  }

  load(layouts) {
    if (Array.isArray(layouts)) {
      this.layouts = layouts.filter_by(layout => layout._type = 'layout');
      this.triggerMap();
    }
  }

  triggerMap() {
    this.SN = _.keyBy(this.layouts, 'system_name');
    this.ID = _.keyBy(this.layouts, 'id');
  }

  getById(id) {
    return this.ID[id] ? this.ID[id] : null;
  }

  addOrUpdate(layout) {
    if (this.ID[layout.id]) {
      const index = this.layouts.findIndex(item => item.id === layout.id);
      this.layouts[index] = layout;
    } else {
      this.layouts.push(layout);
    }
    this.ID[layout.id] = layout;
    this.SN[layout.system_name] = layout;
  }

  //Key should be id or sn
  deleteByKey(key) {
    const item = this.ID[key] || this.SN[key];
    if (item) {
      delete this.ID[item.id];
      delete this.SN[item.system_name];
      const index = this.layouts.findIndex(layout => item.id === layout.id);
      delete this.layouts[index];
    }
  }

  getBySystemName(name) {
    return this.SN[name] ? this.SN[name] : null;
  }
};
