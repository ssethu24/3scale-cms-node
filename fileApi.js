const WRK_DIR = '../api-portal-documentation';
const fs = require('fs');
const path = require('path');
const Section = require('./section');
const File = require('./file');
const API = require('./api');

const api = new API('https://3scale-uat13-admin.uat.bluescape.com', '35aa72cd8f9907e018a1d3f4d0818d9ca03d8e4dabfa719ea6df3ed27cfd3f94');

const SECTION = new Section();
const FILE = new File();

async function getSectionPath(sectionPath) {
  const section = SECTION.getSectionByPartialPath(sectionPath);
  if (section) {
    return section;
  } else {
    // create new Section
    const paths = sectionPath.split('/');
    const title = paths.pop();
    const parent = await getSectionPath(path.join('/', paths.join('/')));
    const section = {
      partial_path: sectionPath,
      parent_id: parent.id,
      title: title,
      public: true,
      system_name: sectionPath,
    };
    const newSession = await api.createSection(section);
    SECTION.addOrUpdateSection(newSession);
    return newSession;
  }
}

async function syncCloud(file) {
  const oldFile = FILE.getByPath(path.join(file.sectionPath, file.fileName));
  file.path = path.join(file.sectionPath, file.fileName);
  if (oldFile) {
    // update file
    console.log("UPDATE: Uploading", file.path)
    await api.updateFile(oldFile.id, file);

  } else {
    //create
    // find the sectionId
    let section = await getSectionPath(file.sectionPath);
    file.section_id = section.id;
    console.log("NEW: Uploading File now init", file.path);
    await api.createFile(file);
  }
}


async function processDir(dir, baseDir) {
  const lists = fs.readdirSync(dir);
  for (const list of lists) {
    if (fs.statSync(path.join(dir, list)).isFile() && list[0] !== '.') {
      const basePath = dir.split(baseDir)[1];
      const file = {
        sectionPath: basePath ? basePath : '/',
        fileName: list,
        filePath: path.join(dir, list)
      };
      await syncCloud(file);
    } else if (fs.statSync(path.join(dir, list)).isDirectory()) {
      await processDir(path.join(dir, list), baseDir);
    }
  }
};

async function uploadFile(wrkDir) {
  let destFiles = await api.list('file');
  FILE.load(destFiles);
  let destSections = await api.list('section');
  SECTION.load(destSections);
  const baseDirPath = path.join(wrkDir, '/files');
  await processDir(baseDirPath, baseDirPath);
}


uploadFile(WRK_DIR);
