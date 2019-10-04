var asyncMiddleware = require("../utils/asyncMiddleware");
const agenda = require("../utils/agenda.js");
const IMPORT_COMMONS_API_DATA = require("../jobs/IMPORT_COMMONS_API_DATA")
    .IMPORT_COMMONS_API_DATA;
require("dotenv").load();
const logger = require("../utils/logger");

const Ajv = require("ajv");

const interval = process.env.IMPORT_DEBOUNCE_INTERVAL || 180000; // default is three minutes
const ajv = new Ajv();
ajv.addMetaSchema(
    require("../node_modules/ajv/lib/refs/json-schema-draft-06.json")
);
const uriSchema = {
    type: "string",
    format: "uri"
};
var validateUri = ajv.compile(uriSchema);

exports.notify = asyncMiddleware(async (req, res) => {
    const url = req.query.url;
    const itemId = req.query.item;
    const updateAvailability = req.query.availability === "true";
    const updateLocations =
        req.query.locations === "true" ||
        (!updateAvailability && req.query.locations !== "false");
    const updateItems =
        req.query.items === "true" ||
        (!updateAvailability && req.query.items !== "false");
    const updateOwners =
        req.query.owners === "true" ||
        (!updateAvailability && req.query.owners !== "false");
    const updateProjects =
        req.query.projects === "true" ||
        (!updateAvailability && req.query.projects !== "false");
    const data = {
        url,
        itemId,
        updateAvailability,
        updateItems,
        updateLocations,
        updateOwners,
        updateProjects
    };

    if (!validateUri(url)) {
        throw new Error("Invalid url in notification");
    }
    //await importer.importFromUrl(url);
    // debouncing: cancel existing jobs
    await agenda.cancel({
        name: IMPORT_COMMONS_API_DATA,
        data
    });
    const when = new Date(new Date() + parseInt(interval));
    await agenda.schedule(when, IMPORT_COMMONS_API_DATA, data);
    res.send("Scheduled import");
});
