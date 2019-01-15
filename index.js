const API = require('./api');
const Section = require('./section');
const Layout = require('./layout');
const WRK_DIR = '../api-portal-documentation/CMS/';
const api = new API('https://3scale-uat13-admin.uat.bluescape.com', '35aa72cd8f9907e018a1d3f4d0818d9ca03d8e4dabfa719ea6df3ed27cfd3f94');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const _ = require('lodash');

const SECTION = new Section();
const LAYOUT = new Layout();
/*api.list('section').then((results) => {
     console.log(JSON.stringify(results));
});*/

// api.createSection({partial_path: "/test", parent_id: "28", title: "Test6", public: 1, system_name: "test_new3"}).then(console.log)

// api.updateParentIdSection(231, {parent_id: 230});
//  api.deleteSection({id: "239"});
// api.getSectionById(203);

// api.createTemplate({path:"/template", section_name: "Test", section_id: "204", system_name: "main_layout", title: 'Test Template', layout_name: "main_layout", type: "page", filename: "index.html", liquid_enabled: 1})
// api.updateTemplate({id: 528, section_id: "252"})
// api.getTemplateById(449);
// api.deleteTemplate({id: 449});
// api.createFile({ path: '/test/api.js',downloadable: 0, file_path: 'api.js', downloadable:false });
// api.updateFile({ id: '110', path: '/test/api.js', section_id: '204', file_path: 'api.js', downloadable: 1 });
// api.getFileById('110')
//   .then((res) => {
//     console.log(res)
//   })
// api.delete('file','108');

//api.getTemplateById(315).then(console.log)
const getMetaFileLocation = function (dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        if (fs.statSync(path.join(dir, file)).isFile() && file === '.meta.json') {
            filelist.push(path.join(dir, file))
        }
        fs.statSync(path.join(dir, file)).isDirectory()
            ? getMetaFileLocation(path.join(dir, file), filelist)
            : null;
    });
    return filelist;
};


async function iterateSource(WRK_DIR) {
    const fileList = await getMetaFileLocation(WRK_DIR);
    const trivialElemts = await trivialElements(fileList);
    let destSections = await api.list('section');
    SECTION.load(destSections);
    // console.log(SECTION.PP)
    for (const ele of trivialElemts) {
        for (const eles in ele) {
            ele[eles].forEach(async element => {
                const sections = (element.file_path.split('/')).slice(3, -1);
                let _root = '';
                let _parent = null;
                if (!_.isEmpty(sections)) {
                    for (const section of sections) {
                        const _lower = section.replace(/\s+/g, '_').toLowerCase();
                        _root += '/' + _lower;
                        const oldSection = SECTION.getSectionByPartialPath(_root);
                        // console.log('oldSection', _root, oldSection)
                        if (!oldSection) {
                            let params = {partial_path: "/" + _lower, title: section, system_name: _lower};
                            if (_parent) {
                                params.parent_id = _parent.parent_id;
                            }
                            _parent = await api.createSection(params);
                            SECTION.addOrUpdateSection(_parent);
                        } else {
                            _parent = oldSection;
                        }
                        element.section_id = _parent ? _parent.id : null;
                        await fileCreateOrUpdate(element, _root);
                    }
                }
            });
        }
    }
}

async function trivialElements(fileList) {
    const layout = [];
    const files = [];
    const builtin_page = [];
    const page = [];
    const partial = [];
    for (const file of fileList) {
        const json = await fse.readJson(`${file}`);
        for (const element of json) {
            element.file_path = file;
            switch (element.type) {
                case 'layout':
                    layout.push(element);
                    break;
                case 'file':
                    files.push(element);
                    break;
                case 'page':
                    page.push(element);
                    break;
                case 'partial':
                    partial.push(element);
                    break;
                case 'builtin_page':
                    builtin_page.push(element);
                    break;
            }
        }
    }
    return [{layout}, {page}, {files}, {partial}, {builtin_page}];
}

async function fileCreateOrUpdate(element, file) {
    let page;
    let fP;
    fP = (element.file_path.split('/')).slice(0, -1);
    element.filePath = fP.push(element.file_name);
    element.filePath = fP.join('/');
    switch (element.type) {
        case 'page':
            element.path = file;
            page = await api.createTemplate(element);
            console.log(element, page);
            break;
        case 'builtin_page':
            element.path = file;
            let builtJson = await fse.readJson(`./built_in.json`);
            builtJson = await _.keyBy(builtJson, 'system_name');
            page = await api.updateBuiltinPage(builtJson[element.system_name].id, element);
            console.log(element, page);
            break;
        case 'partial':
            element.path = file;
            api.createPartial(element);
            break;
        case 'layout':
            delete element.file_path;
            element.path = '/layouts';
            page = await api.createLayout(element);
            console.log(element, page);
            break;
        case 'file':
            page = await api.createFile(element);
            console.log(element, page);
            break;
        default:
    }
}

async function flush(api) {
    this.type = ['file', 'template', 'section'];
    for (const key of this.type) {
        const results = await api.list(key);
        console.log(results);
        for (const result of results) {
            console.log('\n\n', result.id)
            await api.delete(key, result.id);
        }
    }
}

async function deleteAndCreate(api) {
    // await flush(api);
    await iterateSource(WRK_DIR);
}

deleteAndCreate(api);
// const filelist = getMetaFileLocation(WRK_DIR);
// console.log(trivialElements(filelist));

/**
 *
 * We need to Iterate the local Dir and find the .meta.json
 * after get the list of .meta.json
 * We need to trivial the object like layout,page,builtin_page,partials, partial
 * we need to call 2 remote API and cache as locally  1.Sections & Templates (layout)
 *
 * Upload Process : layout
 * 1st we need to upload the layout. because other object will use layout name so it will get error
 * Before create layout we need to check that layout already exits in remote base Key: system_name
 * If exits we need to update if not then create layout
 *  We need to check same object in remote base if not create else update the content & meta if you can.
 * Upload Process : Partials
 * Upload Process: Sections
 * Upload Process: BuiltInPage
 * Upload Process: Page
 * Upload Process: File
 */
