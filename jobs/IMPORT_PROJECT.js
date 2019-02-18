var importer = require("../utils/CommonsApiImporter");
const logger = require("../utils/logger");

const IMPORT_PROJECT = (exports.IMPORT_PROJECT = "IMPORT_PROJECT");
exports.default = function(agenda) {
  agenda.define(IMPORT_PROJECT, function(job, done) {
    logger.log("info", "Starting import of project: " + job.url);
    importer
      .importFromCommonsApiEndpoint(job.url)
      .then(() => done(), error => done(error));
  });
};
