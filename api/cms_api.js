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
    return fetch(`${this.baseUrl}/${this.kindKey[kind]}.xml?per_page=1&access_token=${this.providerKey}`)
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
    return fetch(`${this.baseUrl}/${this.kindKey[kind]}.xml?per_page=100&page=${page}&access_token=${this.providerKey}`)
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
    return fetch(`${this.baseUrl}/${this.kindKey[kind]}/${id}.json?access_token=${this.providerKey}`, { method: 'DELETE' })
      .then(res => res)
      .then(json => json.status)
      .catch(console.log);
  }

  getFileById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['file']}/${id}.json?access_token=${this.providerKey}`)
      .then(res => res.buffer())
      .then(buf => buf.toString())
      .then(console.log);
  }

  createFile(file) {
    const form = new form_data();
    // form.append('downloadable', file.downloadable || 0);
    if (file.section_id) {
      form.append('section_id', file.section_id);
    }
    if (file.tag_list) {
      form.append('tag_list', file.tag_list);
    }
    form.append('attachment', fs.createReadStream(file.filePath));
    form.append('path', file.path);
    return fetch(`${this.baseUrl}/${this.kindKey['file']}.json?access_token=${this.providerKey}`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    })
      .then(res => res.buffer())
      .then(buf => buf.toString())
      .then(console.log);
  }

  updateFile(id, file) {
    console.log(id, file);
    const form = new form_data();
    /*form.append('downloadable', file.downloadable || 0);
    if (file.section_id) {
        form.append('section_id', file.section_id);
    }
    if (file.tag_list) {
        form.append('tag_list', file.tag_list);
    }
    form.append('path', file.path);*/
    form.append('attachment', fs.createReadStream(file.filePath));
    //form.append('title', file.title);
    return fetch(`${this.baseUrl}/${this.kindKey['file']}/${id}.json?access_token=${this.providerKey}`, {
      method: 'PUT',
      headers: form.getHeaders(),
      body: form,
    })
      .then(res => res.json())
      .then(console.log);
  }

  getSectionById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['section']}/${id}.json?access_token=${this.providerKey}`)
      .then(res => res.json())
      .then(json => (json.status) ? json.status : json.section)
      .catch(error => console.log);
  }

  createSection(section) {
    section.access_token = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['section']}.json`, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    }).then(res => res.json())
      .then((result) => result.section);
  }

  /*    updateParentIdSection(id, parentId) {
          return fetch('https://3scale-uat11-admin.uat.bluescape.com/p/admin/cms/sections/230', {
              method: 'POST',
              headers: {
                  'Cookie': 'cms-advanced-options=false; _ga=GA1.2.1450084699.1527059597; __hstc=119987863.0a02fe7c5b35f4f288c1e2c08f8e05bf.1534979801737.1543967501269.1547054042288.33; hubspotutk=0a02fe7c5b35f4f288c1e2c08f8e05bf; hsfirstvisit=; __hssrc=1; _system_session=NXhUNHBxdzdVR2Y5NDRmT1NhK1RGY2VvamNKQURWZHhSTVMzTGhNVGxuRjY2YXJlakdMcFhzTFdVR1plT2RTMW9wTE9rZXFPTmYvdEQyNmFkVFFXaWxWUFY4ZFg4di9YMlZteTJEaFhuUVJNQjRFaUFhVncxQmt6V0t6VkpCNEZLYkU5aVBtRG5xRmRiSEJNT1F6V2VTYkpXWmNBM2JMM0IxU09oeUlULzJIR3pzYlZUc1J1MzVRa3p6NFNCcDMvNERTWlM5RVA2b0huTFNkdmRvUVJ2a05PM1NOb1AwS3I1Q2ZkVmltczQ5ST0tLStRendTUG9zYUZ1TnBIOWMrVVYrdlE9PQ%3D%3D--f7cffa274aa5a6f80bebadf73ed78861bca4048b; bdeb2384dc68f0ed784496ff65848c40=b920a3c852c5a9172b72f402099be3f9; cms-toggle-ids=%5B%22cms-sidebar-section-166%22%2C%22cms-sidebar-section-165%22%5D; cms-filter-string=%7B%22origin%22%3Anull%2C%22types%22%3A%5B%22section%22%5D%7D; authentication-settings-toggle-cookie=true; policies-rules=true; user_session=InFocDRYaVk3OUtlcWN1Nno0R2E0Z0psN21fX3JKUEpPWndFaUJUeWtBY2ci--59a38f417edd078d8f322d4454cc0893e93447f5',
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: 'utf8=%E2%9C%93&_method=patch&authenticity_token=IDAIKtugYjNF8ONHK5IBlKW1TqfmH7iG15GChd0oCq7mV5Z99NjTn8H89WxIFFZbJpGveqRviLdPjaPz36FQnA%3D%3D&cms_section%5Btitle%5D=MAIN&cms_section%5Bpublic%5D=1&cms_section%5Bparent_id%5D=229&cms_section%5Bpartial_path%5D=%2Fmain_tesing&commit=Save'
          })
              .then(res => res.buffer())
              .then(buf => buf.toString())
              .then(console.log)
              .catch(console.log);
      }*/
  updateSection(id, section) {
    return fetch(`${this.baseUrl}/${this.kindKey['section']}/${id}.json?access_token=${this.providerKey}`, {
      method: 'put',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    })
      .then(res => res.json())
  }

  deleteSection(section) {
    section.access_token = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['section']}/${section.id}.json?access_token=${this.providerKey}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(section)
    })
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(error => console.log);
  }

  getTemplateById(id) {
    return fetch(`${this.baseUrl}/${this.kindKey['template']}/${id}.xml?access_token=${this.providerKey}`)
      .then(res => res.buffer())
      .then(xml => parser.toJson(xml.toString(), { object: true }))

  }

  createTemplate(template) {
    if (template.filePath) {
      template.draft = fs.readFileSync(template.filePath, 'utf8');
    }
    return fetch(`${this.baseUrl}/${this.kindKey['template']}.json?access_token=${this.providerKey}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    })
      .then(res => res.json())
  }

  updateTemplate(id, template) {
    if (template.filePath) {
      template.draft = fs.readFileSync(template.filePath, 'utf8');
    }
    return fetch(`${this.baseUrl}/${this.kindKey['template']}/${id}.json?access_token=${this.providerKey}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    })
      .then(res => res.json())
  }

  deleteTemplate(template) {
    template.access_token = this.providerKey;
    return fetch(`${this.baseUrl}/${this.kindKey['template']}/${template.id}.json?access_token=${this.providerKey}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
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

  createPage(page) {
    const template = {
      type: 'page',
      filePath: page.filePath,
      title: page.title,
      path: page.path,
      layout: page.layout,
      liquid_enabled: page.liquid_enabled,
      content_type: page.content_type,
      section_id: page.section_id,
      // tag_list: page.tag_list,
    };
    return this.createTemplate(template).then(outTemplate => outTemplate.partial);
  }

  createPartial(partial) {
    const template = {
      type: 'partial',
      system_name: partial.system_name,
      filePath: partial.filePath,
    };
    return this.createTemplate(template).then(outTemplate => outTemplate.partial);
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
