const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const api = require('./api');
const utils = require('./utils');
const logger = require('./logger');
const { Section, File, Layout, Partial, BuiltinPage } = require('./model');

async function getSectionByPath(sectionPath) {
  const section = Section.getSectionByPartialPath(sectionPath);
  if (section) {
    return section;
  } else {
    // create new Section
    const sectionDirs = sectionPath.split('/');
    const title = sectionDirs.pop();
    const parent = await getSectionByPath(path.join('/', sectionDirs.join('/')));
    const section = {
      partial_path: sectionPath,
      parent_id: parent.id,
      title: title,
      public: true,
      system_name: sectionPath,
    };
    const newSession = await api.createSection(section);
    Section.addOrUpdateSection(newSession);
    return newSession;
  }
}

async function uploadLayouts(dir) {
  let layouts = null;
  try {
    layouts = await fse.readJson(path.join(dir, '/layouts', '.meta.json'));
    for (const layout of layouts) {
      layout.filePath = path.join(dir, '/layouts/', layout.file_name);
      const oldLayout = Layout.getBySystemName(layout.system_name);
      if (oldLayout) {
        logger.info("Update Layout", { systemName: layout.system_name });
        await api.updateLayout(oldLayout.id, layout);
      } else {
        logger.info("Create New Layout", { systemName: layout.system_name });
        const newLayout = await api.createLayout(layout);
        Layout.addOrUpdate(newLayout);
      }
    }
  } catch (error) {
    logger.error("Layout Upload Error", error);
  }
}

async function uploadPartial(dir) {
  const metaFiles = utils.getMetaFileLocation(path.join(dir, '/partial'));
  for (const metaFile of metaFiles) {
    const partials = await fse.readJson(metaFile);
    for (const partial of partials) {
      const oldPartial = Partial.getBySystemName(partial.system_name);
      const dirPaths = metaFile.split('/');
      dirPaths.pop();
      partial.filePath = path.join(dirPaths.join('/'), partial.file_name);
      if (oldPartial) {
        logger.info("Update Partial", { systemName: partial.system_name });
        await api.updatePartial(oldPartial.id, partial);
      } else {
        logger.info("Create New Partial", { systemName: partial.system_name });
        const newLayout = await api.createPartial(partial);
        Partial.addOrUpdate(newLayout);
      }
    }
  }
}


async function syncFileCloud(file) {
  const oldFile = File.getByPath(path.join(file.sectionPath, file.fileName));
  file.path = path.join(file.sectionPath, file.fileName);
  if (oldFile) {
    // update file
    logger.info("File UPDATE: Uploading", file.path);
    await api.updateFile(oldFile.id, file);

  } else {
    //create
    // find the sectionId
    let section = await getSectionByPath(file.sectionPath);
    file.section_id = section.id;
    logger.info("Create New File now init", file.path);
    await api.createFile(file);
  }
}

async function uploadFile(dir, baseDir) {
  const lists = fs.readdirSync(dir);
  for (const list of lists) {
    if (fs.statSync(path.join(dir, list)).isFile() && list[0] !== '.') {
      const basePath = dir.split(baseDir)[1];
      const file = {
        sectionPath: basePath ? basePath : '/',
        fileName: list,
        filePath: path.join(dir, list)
      };
      await syncFileCloud(file);
    } else if (fs.statSync(path.join(dir, list)).isDirectory()) {
      await uploadFile(path.join(dir, list), baseDir);
    }
  }
};


async function uploadBuiltinPage(dir) {
  const metaFiles = utils.getMetaFileLocation(path.join(dir, '/builtin_page'));
  for (const metaFile of metaFiles) {
    const builtinPages = await fse.readJson(metaFile);
    for (const builtinPage of builtinPages) {
      const oldBuiltinPage = Partial.getBySystemName(builtinPage.system_name);
      const dirPaths = metaFile.split('/');
      dirPaths.pop();
      builtinPage.filePath = path.join(dirPaths.join('/'), builtinPage.file_name);
      if (oldBuiltinPage) {
        logger.info("Update Partial", { systemName: builtinPage.system_name });
        await api.updateBuiltinPage(oldBuiltinPage.id, builtinPage);
      } else {
        logger.error("You can't create builtIn Page", { systemName: builtinPage.system_name });
      }
    }
  }
}

async function uploadPage(dir) {

}

async function upload(WRK_DIR) {
  let templates = await api.list('template');
  Layout.load(templates);
  Partial.load(templates);
  BuiltinPage.load(templates);
  let destSections = await api.list('section');
  Section.load(destSections);

  await uploadLayouts(WRK_DIR);
  await uploadPartial(WRK_DIR);

  await uploadBuiltinPage(WRK_DIR);
  await uploadPage(WRK_DIR);

  let destFiles = await api.list('file');
  File.load(destFiles);
  const baseDirPath = path.join(WRK_DIR, '/files');
  await uploadFile(baseDirPath, baseDirPath);
}

module.exports = upload;
