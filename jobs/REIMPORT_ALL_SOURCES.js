var importer = require("../utils/CommonsApiImporter");

const REIMPORT_ALL_SOURCES = (exports.REIMPORT_ALL_SOURCES =
    "REIMPORT_ALL_SOURCES");
exports.default = function(agenda) {
    agenda.define(REIMPORT_ALL_SOURCES, function(job, done) {
        importer.reimportAllSources().then(() => done(), error => done(error));
    });
};
