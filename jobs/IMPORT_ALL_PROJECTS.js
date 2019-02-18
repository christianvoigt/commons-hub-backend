var importer = require("../utils/CommonsApiImporter");

const IMPORT_ALL_PROJECTS = (exports.IMPORT_ALL_PROJECTS =
  "IMPORT_ALL_PROJECTS");
exports.default = function(agenda) {
  agenda.define(IMPORT_ALL_PROJECTS, function(job, done) {
    importer.importAllProjects().then(() => done(), error => done(error));
  });
};
