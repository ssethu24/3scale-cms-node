const fetch = require('node-fetch');
var parser = require('xml2json');
module.exports = class API3Scale {
  constructor(adminEndpoint, providerKey) {
    this.adminEndpoint = adminEndpoint;
    this.providerKey = providerKey;
    this.baseUrl = `${adminEndpoint}/admin/api/cms`;
    this.kindKey = {
      template: 'templates',
      file: 'files',
      section: 'sections',
    };
  }

  count(kind) {
    return fetch(`${this.baseUrl}/${this.kindKey[kind]}.xml?per_page=1&provider_key=${this.providerKey}`)
      .then(res => res.buffer())
      .then(xml => JSON.parse(parser.toJson(xml.toString())))
      .then(json => {
        let count = 0;
        if (json[`${kind}s`]) {
          count = json[`${kind}s`].total_entries;
        }
        return count;
      })
  }

  list(kind, page = 1) {
    let results = [];
    return fetch(`${this.baseUrl}/${this.kindKey[kind]}.xml?per_page=100&page=${page}&provider_key=${this.providerKey}`)
      .then(res => res.buffer())
      .then(xml => parser.toJson(xml.toString(), { object: true }))
      .then(json => {
        let result = {};
        if (json[this.kindKey[kind]]) {
          result = json[this.kindKey[kind]];
          results = results.concat(this.parseListResponse(result, kind));
          if (result.total_pages && page < result.total_pages) {
            return this.list(kind, page + 1)
              .then(recResults => (results = results.concat(recResults)))
          }
        }
      })
      .then(() => results);
  }

  delete(kind, id) {
    return fetch(`${this.baseUrl}/${this.kindKey[kind]}/${id}.json?provider_key=${this.providerKey}`, { method: 'DELETE' })
      .then(res => res.json())
  }

  fileGetById() {

  }

  getFileById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['file']}/${id}.json?provider_key=${this.providerKey}`)
      .then(res => res.json())
  }

  createFile() {

  }

  updateFile() {

  }



  parseListResponse(values, kind) {
    const results = [];
    ['layout', 'builtin_page', 'builtin_partial', 'partial', 'page', 'file', 'section'].forEach((key) => {
      let templates = [];
      if (key in values) {
        if (!Array.isArray(values[key])) {
          templates = [values[key]];
        } else {
          templates = values[key];
        }
        templates.forEach((template) => {
          template._type = key;
          template._parenntType = kind;
          results.push(template);
        })
      }
    });
    return results;
  }
};
