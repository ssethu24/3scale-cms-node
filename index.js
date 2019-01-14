const API = require('./api');
const Section = require('./section');
const WRK_DIR = '../api-portal-documentation/CMS/';
const api = new API('https://3scale-uat13-admin.uat.bluescape.com', '35aa72cd8f9907e018a1d3f4d0818d9ca03d8e4dabfa719ea6df3ed27cfd3f94');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const _ = require('lodash');

const SECTION = new Section();
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

    let destSections = await api.list('section');
    SECTION.load(destSections);
    // console.log(SECTION.PP)
    for (const file of fileList) {
        const sections = (file.split('/')).slice(3, -1);
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
            }
        }
        const json = await fse.readJson(`${file}`);
        for (const element of json) {

            element.section_id = _parent ? _parent.id : null;
            await fileCreateOrUpdate(element, _root);

        }
    }
}

async function fileCreateOrUpdate(element, file) {
    switch (element.type) {
        case 'page':
            element.path = file + element.path;
            const page = await api.createTemplate(element);
            console.log(element, page);
            break;
        case 'layout':
            break;
        case 'partial':
            break;
        case 'file':
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
