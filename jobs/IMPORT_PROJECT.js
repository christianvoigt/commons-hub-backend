var importer = require("../utils/CommonsApiImporter");
const logger = require("../utils/logger");

const IMPORT_PROJECT = (exports.IMPORT_PROJECT = "IMPORT_PROJECT");
exports.default = function(agenda) {
  agenda.define(IMPORT_PROJECT, function(job, done) {
    const { url } = job.attrs.data;
    importer
      .importFromCommonsApiEndpoint(url)
      .then(() => done(), error => done(error));
  });
};
