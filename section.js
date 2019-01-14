const _ = require('lodash');

module.exports = class Section {
    constructor(sections) {
        this.sections = Array.isArray(sections) ? sections : [];
        this.SN = {};
        this.ID = {};
        this.PP = {};
        this.triggerMap();
    }

    load(sections) {
        if (Array.isArray(sections)) {
            this.sections = sections;
            this.triggerMap();
        }
    }

    triggerMap() {
        this.SN = _.keyBy(this.sections, 'system_name');
        this.ID = _.keyBy(this.sections, 'id');
        this.PP = _.keyBy(this.sections, 'partial_path');
    }

    getById(id) {
        return this.ID[id] ? this.ID[id] : null;
    }

    addOrUpdateSection(section) {
        if (this.ID[section.id]) {
            const index = this.sections.findIndex(item => item.id === section.id);
            this.sections[index] = section;
        } else {
            this.sections.push(section);
        }
        this.ID[section.id] = section;
        this.SN[section.system_name] = section;
        this.PP[section.partial_path] = section;
    }

    //Key should be id or sn
    deleteByKey(key) {
        const item = this.ID[key] || this.SN[key];
        if (item) {
            delete this.ID[item.id];
            delete this.SN[item.system_name];
            delete this.PP[item.partial_path];
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

    getSystemName(id) {
        return this.ID[id] ? this.ID[id].system_name : null;
    }
};
