const fse = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const API = require('./api');
const { getFileExt } = require('./utils');

const api = new API('https://bluescape-admin.3scale.net', 'f01e5e0ed446621d5f09aff6736f869d1f982a670cf4a1e8a0fe8a3ce77e0bb8');

async function download() {
  const WRK_DIR = './cms_src1';

  await fse.emptyDir(WRK_DIR);


  /** Fetch & write Section List **/
  //const sections = await api.list('section');
  // await fse.outputJson(`${WRK_DIR}/sections.json`, sections);


  /** Fetch & write templates List **/
  const templates = await api.list('template');
  await fse.outputJson(`${WRK_DIR}/templates.json`, templates);

  // download template and  write in local file
  for (const item of templates) {
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
    let pa = writeKey.split('/');
    pa.pop();
    const metaPath = `${pa.join('/')}/.meta.json`;
    let metaData = null;
    try {
      metaData = await fse.readJson(metaPath)
    } catch (err) {
      //  console.error(err)
    }
    if (metaData) {
      metaData.push(getMetaData(item))
    } else {
      metaData = [getMetaData(item)]
    }
    const ext = getFileExt(template.content_type);
    metaData.ext = ext;
    await fse.outputJson(metaPath, metaData);
    await fse.outputFile(`${writeKey}.${ext}`, _.isEmpty(template.published) ? '' : template.published)
    console.log(writeKey);
  }

  /** Fetch & write templates List **/
  /*
    const files = await api.list('file');
    await fse.outputJson(`${WRK_DIR}/files.json`, files);
    for (const item of templates) {
      const content = await api.fetchFileFromUrl(item.url);
      let writeKey = `${WRK_DIR}/files/${item.path}`;
      await fse.outputFile(writeKey, content);
    }*/
};

function getMetaData(element) {
  const data = {
    type: element._type
  };
  switch (element._type) {
    case 'builtin_page':
      data.system_name = element.system_name;
      data.file_name = `${element.system_name.split('/').splice(-1)}.html`;
      data.layout = element.layout;
      break;
    case 'page':
      data.title = element.title;
      data.path = element.path;
      data.layout = element.layout;
      data.liquid_enabled = element.liquid_enabled;
      data.content_type = element.content_type;
      data.tag_list = element.tag_list;
      data.file_name = `${element.title}.${element.ext}`;
      break;
    case 'layout':
      data.title = element.title;
      data.system_name = element.system_name;
      data.liquid_enabled = element.liquid_enabled;
      data.content_type = element.content_type;
      data.file_name = `${element.title}.html`;
      break;
    case 'builtin_partial':
    case 'partial':
      data.system_name = element.system_name;
      data.file_name = `${element.system_name.split('/').splice(-1)}.html`;
      break;
    case 'file':
      data.downloadable = element.downloadable ? element.downloadable : false;
      data.title = element.title;
      data.file_name = `${element.title}.${element.ext}`;
      data.tag_list = _.isEmpty(element.tag_list) ? element.tag_list : [];
      break;
    default:
  }
  return data;
}


download().then((result) => {
//  console.log(result);
})

