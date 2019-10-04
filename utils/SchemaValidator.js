const commonsApiItemsSource = require("../node_modules/commons-api/commons-api.items.schema.json");
const commonsApiLocationsSource = require("../node_modules/commons-api/commons-api.locations.schema.json");
const commonsApiOwnersSource = require("../node_modules/commons-api/commons-api.owners.schema.json");
const commonsApiProjectsSource = require("../node_modules/commons-api/commons-api.projects.schema.json");
const commonsApiAvailabilitySource = require("../node_modules/commons-api/commons-api.availability.schema.json");
const velogisticsApiItemsSource = require("../node_modules/commons-api/velogistics-api.items.schema.json");
const Ajv = require("ajv");
const ajv = new Ajv();
ajv.addMetaSchema(
    require("../node_modules/ajv/lib/refs/json-schema-draft-06.json")
);
ajv.addSchema(commonsApiItemsSource, "commons-api.items");
ajv.addSchema(commonsApiLocationsSource, "commons-api.locations");
ajv.addSchema(commonsApiOwnersSource, "commons-api.owners");
ajv.addSchema(commonsApiProjectsSource, "commons-api.projects");
ajv.addSchema(commonsApiAvailabilitySource, "commons-api.availability");
ajv.addSchema(velogisticsApiItemsSource, "velogistics-api.items");
const validateItems = ajv.getSchema("velogistics-api.items");
const validateAvailability = ajv.getSchema("velogistics-api.availability");
module.exports = {
    items: validateItems,
    availability: validateAvailability
};
