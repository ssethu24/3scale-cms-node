const API = require('./api');




/*api.list('section').then((results) => {
    // console.log(JSON.stringify(results));
});*/

// api.createSection({partial_path: "/test", parent_id: "28", title: "Test", public: 1})
// api.updateSection({id: "203", partial_path: "/new", parent_id: "28", title: "Test", public: 1})
//  api.deleteSection({id: "203"});
// api.getSectionById(203);

// api.createTemplate({path:"/template", section_name: "Test", section_id: "204", system_name: "main_layout", title: 'Test Template', layout_name: "main_layout", type: "page", filename: "index.html", liquid_enabled: 1})
// api.updateTemplate({id: 449, filename: "index.html"})
// api.getTemplateById(449);
// api.deleteTemplate({id: 449});
// api.createFile({ path: '/test/api.js',downloadable: 0, file_path: 'api.js', downloadable:false });
// api.updateFile({ id: '110', path: '/test/api.js', section_id: '204', file_path: 'api.js', downloadable: 1 });
// api.getFileById('110')
//   .then((res) => {
//     console.log(res)
//   })
// api.delete('file','108');

api.getTemplateById(315).then(console.log)
