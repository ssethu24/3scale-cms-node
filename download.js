const fse = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const API = require('./api');
const { getFileExt } = require('./utils');





async function download() {
  const WRK_DIR = './cms_src';

  await fse.emptyDir(WRK_DIR);


  /** Fetch & write Section List **/
  const sections = await api.list('section');
  await fse.outputJson(`${WRK_DIR}/sections.json`, sections);


  /** Fetch & write templates List **/
  const templates = await api.list('template');
  await fse.outputJson(`${WRK_DIR}/templates.json`, templates);

  // download template and  write in local file
  templates.forEach(async (item, index) => {
    const { [item._type]: template } = await api.getTemplateById(item.id);
    let writeKey = '';
    if (item.system_name && !_.isEmpty(item.system_name)) {
      writeKey = `${WRK_DIR}/templates/${item._type}/${item.system_name}`
    } else {
      if (item.path === '/') {
        item.path = 'index'
      }
      writeKey = path.join(`${WRK_DIR}/templates/${item._type}/__path/`, item.path);
    }
    const ext = getFileExt(template.content_type);
    await fse.outputFile(`${writeKey}.${ext}`, _.isEmpty(template.published) ? '' : template.published)
  });

  /** Fetch & write templates List **/

  const files = await api.list('file');
  await fse.outputJson(`${WRK_DIR}/files.json`, files);
  files.forEach(async (item) => {
    const content = await api.fetchFileFromUrl(item.url);
    let writeKey = `${WRK_DIR}/files/${item.path}`;
    await fse.outputFile(writeKey, content);
  });
};

download().then((result) => {
//  console.log(result);
})


