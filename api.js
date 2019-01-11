const fetch = require('node-fetch');
const path = require('path');
const parser = require('xml2json');
const fs = require('fs');
const form_data = require('form-data');

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

  getFileById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['file']}/${id}.json?provider_key=${this.providerKey}`)
      .then(res => res.json())
  }

  createFile(file) {
    const form = new form_data();
    if (file.downloadable) {
      form.append('downloadable', file.downloadable);
    }
    form.append('attachment', fs.createReadStream(file.file_path));
    form.append('path', file.path);
    delete file.file_path;
    return fetch(`${this.baseUrl}/${this.kindKey['file']}.json?provider_key=${this.providerKey}`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    })
      .then(res => res.buffer())
      .then(result => console.log(result.toString()))
  }

  updateFile(file) {
    const form = new form_data();
    if (file.section_id) {
      form.append('section_id', file.section_id);
    }
    if (file.downloadable) {
      form.append('downloadable', file.downloadable);
    }
    form.append('attachment', fs.createReadStream(file.file_path));
    form.append('path', file.path);
    return fetch(`${this.baseUrl}/${this.kindKey['file']}/${file.id}.json?provider_key=${this.providerKey}`, {
      method: 'PUT',
      headers: form.getHeaders(),
      body: form,
    })
      .then((res) => {
        console.log(res)
      })
  }

  getSectionById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['section']}/${id}.json?provider_key=${this.providerKey}`)
      .then(res => res.json())
      .then(json => (json.status) ? json.status : json.section)
      .catch(error => console.log);
  }

  createSection(section) {
    section.provider_key = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['section']}.json`, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    })
      .then(res => res.json())
      .then(json => json)
      .catch(error => console.log);
  }

  updateSection(section) {
    section.provider_key = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['section']}/${section.id}.json`, {
      method: 'put',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    })
      .then(res => res.json())
      .then(json => json.status)
      .catch(error => console.log);
  }

  deleteSection(section) {
    section.provider_key = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['section']}/${section.id}.json?provider_key=${this.providerKey}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    })
      .then(res => res.json())
      .then(json => json.status)
      .catch(error => console.log);
  }

  getTemplateById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['template']}/${id}.xml?provider_key=${this.providerKey}`)
      .then(res => res.buffer())
      .then(xml => parser.toJson(xml.toString(), { object: true }))

  }

  createTemplate(template) {
    template.draft = fs.readFileSync(template.filePath, 'utf8');
    return fetch(`${this.baseUrl}/${this.kindKey['template']}.json?provider_key=${this.providerKey}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    })
      .then(res => res.json())
  }

  updateTemplate(id, template) {
    template.draft = fs.readFileSync(template.filePath, 'utf8');
    return fetch(`${this.baseUrl}/${this.kindKey['template']}/${id}.json?provider_key=${this.providerKey}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    })
      .then(res => res.json())
  }

  deleteTemplate(template) {
    template.provider_key = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['template']}/${template.id}.json?provider_key=${this.providerKey}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    })
      .then(res => res.json())
      .then(json => json.status)
      .catch(error => console.log);
  }

  fetchFileFromUrl(url) {
    url = url.startsWith('http') ? url : `${this.adminEndpoint}${url}`;
    return fetch(url)
      .then(res => res.text())
  }

  createLayout(layout) {
    const template = {
      type: 'layout',
      title: layout.title,
      system_name: layout.system_name,
      liquid_enabled: layout.liquid_enabled ? layout.liquid_enabled : false,
      filePath: layout.filePath,
    };
    return this.createTemplate(template).then(outTemplate => outTemplate.layout);
  }

  updateLayout(id, layout) {
    const template = {
      title: layout.title,
      system_name: layout.system_name,
      liquid_enabled: layout.liquid_enabled ? layout.liquid_enabled : false,
      filePath: layout.filePath,
    };
    return this.updateTemplate(id, template).then(outTemplate => outTemplate.layout);
  }

  createPartial(partial) {
    const template = {
      type: 'partial',
      system_name: partial.system_name,
      filePath: partial.filePath,
    };
    return this.createTemplate(template).then(outTemplate => outTemplate.layout);
  }

  updatePartial(id, partial) {
    const template = {
      system_name: partial.system_name,
      filePath: partial.filePath,
    };
    return this.updateTemplate(id, template).then(outTemplate => outTemplate.layout);
  }

  updateBuiltInPartial(id, partial) {
    const template = {
      filePath: partial.filePath,
    };
    return this.updateTemplate(id, template).then(outTemplate => outTemplate.layout);
  }

  updateBuiltinPage(id, builtinPage) {
    const template = {
      //layout_name: builtinPage.layout_name,
      filePath: builtinPage.filePath,
    };
    return this.updateTemplate(id, template).then(outTemplate => outTemplate.layout);
  }



  /** private method **/
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
          template._parentType = kind;
          results.push(template);
        })
      }
    });
    return results;
  }
};
