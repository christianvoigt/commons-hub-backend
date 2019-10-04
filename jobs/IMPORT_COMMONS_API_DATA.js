var importer = require("../utils/CommonsApiImporter");
const logger = require("../utils/logger");

const IMPORT_COMMONS_API_DATA = (exports.IMPORT_COMMONS_API_DATA =
    "IMPORT_COMMONS_API_DATA");
exports.default = function(agenda) {
    agenda.define(IMPORT_COMMONS_API_DATA, function(job, done) {
        importer
            .importFromSource(job.attrs.data)
            .then(() => done(), error => done(error));
    });
};
