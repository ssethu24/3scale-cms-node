const fse = require('fs-extra');
const _ = require('lodash');
const API = require('./api');
const { getFileExt } = require('./utils');

const WRK_DIR = './cms_src';
const SRC_DICT = {
  layout: new Map(),
  builtin_page: new Map(),
  builtin_partial: new Map(),
  partial: new Map(),
  page: new Map(),
  file: new Map(),
  section: new Map(),
};
const DEST_DICT = {
  layout: new Map(),
  builtin_page: new Map(),
  builtin_partial: new Map(),
  partial: new Map(),
  page: new Map(),
  file: new Map(),
  section: new Map(),
};

const api = new API();


function setPathKey(id, map) {
  const map = _.keyBy(sections, 'id');
  return sections.forEach(section => {
    if (!section.parent_id)

      })
}

function preProcessUploadSection(srcSections, destSections) {
  srcSections = setPathKey(srcSections);
  const srcMap = _.keyBy(srcSections, 'id');


  console.log(srcMap)


}

function preProcessUploadTemplate(type, srcTemplates, destTemplates) {
  const templateKeys = ['system_name', 'content_type', 'title', 'liquid_enabled', 'handler', 'path', 'hidden', 'layout', 'content_type'];
  const items = [];
  const srcItems = srcTemplates.filter(template => template._type === type);
  const destItems = destTemplates.filter(template => template._type === type);
  const destItem = _.keyBy(destItems, 'system_name');
  srcItems.forEach(item => {
    const newItem = {};
    templateKeys.forEach(key => {
      if (item[key] && !_.isEmpty(item[key]) && (key === 'content_type' || !destItem[item.system_name] || item[key] !== destItem[item.system_name][key])) {
        newItem[key] = item[key];
      }
    });
    newItem._sysyemName = item.system_name;
    if (destItem[item.system_name]) {
      newItem._action = 'update';
      newItem.id = destItem[item.system_name].id;
    } else {
      newItem._action = 'create';
    }
    items.push(newItem);
  });
  return items;
}

async function syncLayoutToCloud(layouts) {
  layouts.forEach(async (layout) => {
    layout.filePath = `${WRK_DIR}/templates/layout/${layout._sysyemName}.${getFileExt(layout.content_type)}`;
    if (layout._action === 'update') {
      await api.updateLayout(layout.id, layout);
    } else {
      const newLayout = await api.createLayout(layout);
      DEST_DICT.layout.set(layout.system_name, newLayout);
    }
  });
}

async function syncBuiltinPartialToCloud(partials) {
  partials.forEach(async (partial) => {
    partial.filePath = `${WRK_DIR}/templates/builtin_partial/${partial._sysyemName}.${getFileExt(partial.content_type)}`;
    if (partial._action === 'update') {
      await api.updateBuiltInPartial(partial.id, partial);
    } else {
      // No create for builtIn Partial
      //const newPartial = await api.createPartial(partial);
      //DEST_DICT.builtin_partial.set(partial.system_name, newPartial);
    }
  });
}

async function syncPartialToCloud(partials) {
  partials.forEach(async (partial) => {
    partial.filePath = `${WRK_DIR}/templates/partial/${partial._sysyemName}.${getFileExt(partial.content_type)}`;
    if (partial._action === 'update') {
      await api.updatePartial(partial.id, partial);
    } else {
      const newPartial = await api.createPartial(partial);
      DEST_DICT.partial.set(partial.system_name, newPartial);
    }
  });
}

async function syncBuiltinPageToCloud(layouts) {
  layouts.forEach(async (layout) => {
    layout.filePath = `${WRK_DIR}/templates/builtin_page/${layout._sysyemName}.${getFileExt(layout.content_type)}`;
    if (layout._action === 'update') {
      await api.updateBuiltinPage(layout.id, layout);
    } else {
      // No Creation
    }
  });
}

async function syncPageToCloud(layouts) {
  layouts.forEach(async (layout) => {
    layout.filePath = `${WRK_DIR}/templates/page/${layout._sysyemName}.${getFileExt(layout.content_type)}`;
    if (layout._action === 'update') {
      await api.updateBuiltinPage(layout.id, layout);
    } else {
      // No Creation
    }
  });
}

async function syncSectionToCloud(sections) {

}

async function upload() {
  const destSections = await api.list('section');
  const srcSections = await fse.readJson(`${WRK_DIR}/_sections.json`);
  const sections = preProcessUploadSection(srcSections, srcSections);
  await syncSectionToCloud(sections);
  /*

    const destTemplates = await api.list('template');
    const srcTemplates = await fse.readJson(`${WRK_DIR}/_templates.json`);


    const layouts = preProcessUploadTemplate('layout', srcTemplates, destTemplates);
    await syncLayoutToCloud(layouts);
    const partials = preProcessUploadTemplate('partial', srcTemplates, destTemplates);
    await syncPartialToCloud(partials);
    const builtinPartials = preProcessUploadTemplate('builtin_partial', srcTemplates, destTemplates);
    await syncBuiltinPartialToCloud(builtinPartials);
    const builtinPages = preProcessUploadTemplate('builtin_page', srcTemplates, destTemplates);
    await syncBuiltinPartialToCloud(builtinPages);

  */

};

upload().then((result) => {
  console.log(result);
})


