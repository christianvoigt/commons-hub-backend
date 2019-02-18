const commonsApiSource = require("./node_modules/commons-api/commons-api.schema.json");
const velogisticsApiSource = require("./node_modules/commons-api/velogistics-api.schema.json");
const Ajv = require("ajv");
const ajv = new Ajv();
ajv.addMetaSchema(
  require("./node_modules/ajv/lib/refs/json-schema-draft-06.json")
);
ajv.addSchema(commonsApiSource, "commons-api");
ajv.addSchema(velogisticsApiSource, "velogistics-api");
const validate = ajv.getSchema("velogistics-api");
validate({});
console.log(validate.errors);
