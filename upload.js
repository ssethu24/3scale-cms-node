const fse = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const API = require('./api');
const Section = require('./section');
const { getFileExt } = require('./utils');

const WRK_DIR = '../api-portal-documentation';

const GL_SEC_S = new Section();
const GL_SEC_D = new Section();

const api = new API('https://3scale-uat11-admin.uat.bluescape.com', '45c6ce7deec4b96c742f0face34f125f');


function buildPathKey(sections) {
  let keyMap = {};
  const map = _.keyBy(sections, 'id');

  function getRoot(sec) {
    let findRoot = [];
    findRoot.push(sec.system_name);
    if (!_.isEmpty(sec.parent_id)) {
      findRoot = findRoot.concat(getRoot(map[sec.parent_id]));
    }
    return findRoot;
  }

  sections.forEach(section => {
    const pathKey = _.reverse(getRoot(section)).join('~~');
    section._pathKey = pathKey;
    keyMap[pathkey] = section;
  });
  return keyMap;
}

async function syncSectionToCloud(srcSections, destSections) {
  //const srcPathKeyMap = buildPathKey(srcSections);
  const destSNMap = _.keyBy(destSections, 'system_name');
  const destIDMap = _.keyBy(destSections, 'id');
  const srcIDMap = _.keyBy(srcSections, 'id');


  function updateHashMap(section) {
    destSNMap[section.system_name] = section;
    destIDMap[section.id] = section;
  }

  async function syncParentSections(sectionId) {
    const srcSection = srcIDMap[sectionId];
    if (destSNMap[srcSection.system_name]) {
      return destSNMap[srcSection.system_name].id
    } else {
      const params = {
        public: srcSection.public,
        partial_path: srcSection.partial_path,
        title: srcSection.title,
        system_name: srcSection.system_name,
      };
      const section = await api.createSection(params);
      updateHashMap(section);
      return section.id;
    }
  }

  for (const section of srcSections) {
    const params = {
      public: section.public,
      partial_path: section.partial_path,
      title: section.title,
    };
    if (destSNMap[section.system_name]) {
      const destSection = destSNMap[section.system_name];
      // update
      if (!_.isEmpty(section.parent_id) && srcIDMap[section.parent_id].system_name !== destIDMap[destSection.parent_id].system_name) {
        params.parent_id = await syncParentSections(section.parent_id);
      }
      //partial_path,public,title,parent_id
      await api.updateSection(destSection.id, params);
      params.id = destSection.id;
      params.system_name = destSection.system_name;
      updateHashMap(params);
    } else {
      params.system_name = section.system_name;
      //create
      if (!_.isEmpty(section.parent_id)) {
        params.parent_id = await syncParentSections(section.parent_id);
      }
      const newSection = await api.createSection(params);
      updateHashMap(newSection);
    }
  }

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

function getDestSectionId(srcId) {
  const srcSystemName = GL_SEC_S.getSystemName(srcId);
  const dest = GL_SEC_D.getBySystemName(srcSystemName);
  return dest ? dest.id : null;
}

async function syncFileToCloud(files, destFiles) {
  const destPathMap = _.keyBy(destFiles, 'path');
  for (const file of files) {
    const sectionId = getDestSectionId(file.section_id);
    const params = {
      section_id: sectionId,
      tag_list: _.isEmpty(file.tag_list) ? '' : file.tag_list,
      title: file.title,
      filePath: file.title,
      downloadable: file.downloadable,
    };
    params.path = file.path;
    params.filePath = path.join(`${WRK_DIR}/files`, file.path);
    if (destPathMap[file.path]) {
      const dest = destPathMap[file.path];
      console.log(dest.id)
      //  await api.delete('file', dest.id);
    }
    const newFile = await api.createFile(params);
    console.log(newFile);
  }
}

async function upload() {

  let destSections = await api.list('section');
  GL_SEC_D.load(destSections);
  const srcSections = await fse.readJson(`${WRK_DIR}/_sections.json`);
  GL_SEC_S.load(srcSections);
  // await syncSectionToCloud(srcSections, destSections);

  //Fetch once again once sessions update
  //destSections = await api.list('section');
  // GL_SEC_D.load(destSections);
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

  // File Upload
  const srcFiles = await fse.readJson(`${WRK_DIR}/_files.json`);
  let destFiles = await api.list('file');
  await syncFileToCloud(srcFiles, destFiles);

};

upload().then((result) => {
  console.log(JSON.stringify(result));
})


