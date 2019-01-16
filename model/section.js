const _ = require('lodash');
const Base = require('./base');
module.exports = class Section extends Base {
  constructor(sections) {
    super();
    this.sections = Array.isArray(sections) ? sections : [];
    this.SN = {};
    this.PP = {};
    this.TITLE_PATH = {};
    this.load(this.sections);
  }

  load(sections) {
    if (Array.isArray(sections)) {
      this.sections = sections;
      this.triggerMap();
    }
  }

  getTitlePathUtil(item) {
    let title = '';
    if (item) {
      if (_.isEmpty(item.parent_id)) {
        title += ''
      } else {
        title += item.title + '/' + this.getTitlePathUtil(this.ID[item.parent_id]);
      }
      return title
    }
  }

  getTitlePath(item) {
    if (item) {
      return this.getTitlePathUtil(item).split('/').reverse().join('/');
    }
    return '/';
  }

  triggerMap() {
    this.ID = _.keyBy(this.sections, 'id');
    this.sections.forEach((section) => {
      section.titlePath = this.getTitlePath(section);
      this.ID[section.id].titlePath = section.titlePath ? section.titlePath : '/'
    });
    this.SN = _.keyBy(this.sections, 'system_name');
    this.PP = _.keyBy(this.sections, 'partial_path');
    this.TITLE_PATH = _.keyBy(this.sections, 'titlePath');
  }

  getById(id) {
    return this.ID[id] ? this.ID[id] : null;
  }

  addOrUpdateSection(section) {
    section.titlePath = this.getTitlePath(section);
    if (this.ID[section.id]) {
      const index = this.sections.findIndex(item => item.id === section.id);
      this.sections[index] = section;
    } else {
      this.sections.push(section);
    }
    this.ID[section.id] = section;
    this.SN[section.system_name] = section;
    this.PP[section.partial_path] = section;
    this.TITLE_PATH[section.titlePath] = section;
  }

  //Key should be id or sn
  deleteByKey(key) {
    const item = this.ID[key] || this.SN[key];
    if (item) {
      delete this.ID[item.id];
      delete this.SN[item.system_name];
      delete this.PP[item.partial_path];
      delete this.TITLE_PATH[item.titlePath];
      const index = this.sections.findIndex(item => item.id === section.id);
      delete this.sections[index];
    }
  }

  getBySystemName(name) {
    return this.SN[name] ? this.SN[name] : null;
  }

  getSectionByPartialPath(name) {
    return this.PP[name] ? this.PP[name] : null;
  }

  getSectionByTitlePath(name) {
    return this.TITLE_PATH[name] ? this.TITLE_PATH[name] : null;
  }

  getSystemName(id) {
    return this.ID[id] ? this.ID[id].system_name : null;
  }
};
