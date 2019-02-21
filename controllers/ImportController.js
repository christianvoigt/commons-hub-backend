var asyncMiddleware = require("../utils/asyncMiddleware");
const agenda = require("../utils/agenda.js");
const IMPORT_PROJECT = require("../jobs/IMPORT_PROJECT").IMPORT_PROJECT;
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
  var url = req.query.url;
  if (!validateUri(url)) {
    throw new Error("Invalid url in notification");
  }
  //await importer.importFromUrl(url);
  // debouncing: cancel existing jobs
  agenda.cancel({ name: IMPORT_PROJECT, data: { url } });
  const when = new Date(new Date() + parseInt(interval));
  agenda.schedule(when, IMPORT_PROJECT, {
    url
  });
  res.send("");
});
