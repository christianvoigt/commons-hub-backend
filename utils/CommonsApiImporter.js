const agenda = require("./agenda.js");
const axios = require("axios");
const mongoose = require("mongoose");
const CProject = require("../models/CProject");
const CItem = require("../models/CItem");
const CSlot = require("../models/CSlot");
const COwner = require("../models/COwner");
const CLocation = require("../models/CLocation");
const logger = require("./logger");
const EMAIL = require("../jobs/EMAIL").EMAIL;
const commonsApiSource = require("../node_modules/commons-api/commons-api.schema.json");
const velogisticsApiSource = require("../node_modules/commons-api/velogistics-api.schema.json");
const Ajv = require("ajv");
const ajv = new Ajv();
require("dotenv").config({ path: __dirname + "/../.env" });
const mailRecipients = process.env.ADMIN_EMAIL_ADRESSES;

ajv.addMetaSchema(
  require("../node_modules/ajv/lib/refs/json-schema-draft-06.json")
);
ajv.addSchema(commonsApiSource);
ajv.addSchema(velogisticsApiSource, "velogistics-api");
const validate = ajv.getSchema("velogistics-api");

const maxContentLength = process.env.IMPORT_MAX_CONTENT_LENGTH || 500000; // default is 500 kb

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const importFromCommonsApiEndpoint = async function(url) {
  // importFromUrl should never throw any errors, so we will catch them all.
  try {
    logger.info(`Trying to import data from url: ${url}`);
    if (process.env.NODE_ENV === "development") {
      logger.info(`Replacing localhost with host.docker.internal`);
      url = url.replace("localhost", "host.docker.internal");
    }
    var project = null;
    project = await CProject.find({ endpoint: url }).exec();
    if (project && project.is_blocked) {
      logger.info("Aborting import, site is blocked.");
      return false;
    }
    const response = await axios.get(url, { maxContentLength });

    if (!response) {
      const e = new Error("Commons api endpoint not found");
      e.name = "EndpointNotFound";
      e.propertyName = "site";
      e.remoteHostname = url;
      throw e;
    }
    await importJson(url, response.data, true);
    logger.info("Successfully finished importing data from: " + url);

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};
const importJson = async function(url, data, sendNotification = true) {
  if (!validate(data)) {
    const e = new Error(
      "Invalid Commons Api data: \n" + JSON.stringify(validate.errors)
    );
    e.name = "InvalidCommonsApiData";
    e.propertyName = "site";
    e.remoteHostname = url;
    throw e;
  }
  let project = await CProject.findOne({ endpoint: url }).exec();
  if (project && project.is_blocked) {
    logger.info("Aborting import, site is blocked.");
    return false;
  }
  let isNewProject = false;
  if (!project) {
    isNewProject = true;
    project = createProject(url, data.project);
  } else {
    removeProjectData(project._id);
    project.name = data.project.name;
    project.url = data.project.url;
    project.imported = new Date();
    if (data.project.description) {
      project.description = data.project.description;
    }
  }
  const locationDataArray = data.locations.features.map(l =>
    createLocationData(l, project)
  );
  const ownerDataArray = data.owners.map(o => createOwnerData(o, project));
  let locations, owners;
  const ownerAndLocationPromises = [
    CLocation.insertMany(locationDataArray),
    COwner.insertMany(ownerDataArray),
    project.save()
  ];
  let ownerAndLocationResults = await Promise.all(ownerAndLocationPromises);
  locations = ownerAndLocationResults[0].reduce(reduceToUidDictionary, {});
  owners = ownerAndLocationResults[1].reduce(reduceToUidDictionary, {});

  const itemDataArray = data.items.map(i => createItemData(i, project, owners));
  const slotDataArray = [];
  data.items.forEach(i => {
    const itemData = itemDataArray.find(data => data.uid === i.uid);
    i.availability.reduce((acc, curr) => {
      acc.push(createSlotData(curr, itemData, project, locations));
      return acc;
    }, slotDataArray);
  });
  const itemAndSlotPromises = [
    CItem.insertMany(itemDataArray),
    CSlot.insertMany(slotDataArray)
  ];
  await Promise.all(itemAndSlotPromises);
  if (sendNotification && isNewProject) {
    sendNewProjectNotification(project);
  }
  return true;
};

const importAllProjects = async function() {
  logger.info("Updating all CB instances...");
  const projects = await CProject.find()
    .select("endpoint")
    .exec();
  const promises = [];
  if (projects) {
    for (var project of projects) {
      promises.push(importFromCommonsApiEndpoint(project.endpoint));
    }
  }
  await Promise.all(promises);
  logger.info("Finished updating all CB instances...");
};
const createProject = function(endpointUrl, projectData) {
  let { name, url, description } = projectData;
  return new CProject({
    name,
    endpoint: endpointUrl,
    url: encodeURI(unescapeSlashes(url)),
    description
  });
};
const createLocationData = function(locationData, project) {
  let { name, description, address, uid, url } = locationData.properties;
  let { coordinates } = locationData.geometry;
  return {
    name,
    description,
    address,
    uid,
    url: encodeURI(unescapeSlashes(url)),
    geometry: { type: "Point", coordinates },
    project: project._id
  };
};
const createOwnerData = function(ownerData, project) {
  let { name, description, uid, url } = ownerData;
  return {
    name,
    uid,
    description,
    url: encodeURI(unescapeSlashes(url)),
    project: project._id
  };
};
const createItemData = function(itemApiData, project, owners) {
  let {
    name,
    description,
    uid,
    url,
    owner_uid,
    nr_of_wheels,
    can_transport_children,
    max_transport_weight
  } = itemApiData;
  const itemMongoData = {
    _id: new mongoose.mongo.ObjectId(), // we create the id here so that we can use it in the slot data
    name,
    description,
    uid,
    url: encodeURI(unescapeSlashes(url)),
    project: project._id,
    nrOfWheels: nr_of_wheels,
    canTransportChildren: can_transport_children,
    maxTransportWeigth: max_transport_weight
  };
  if (owner_uid) {
    const owner = owners[owner_uid];
    if (!owner) {
      throw new Error("Owner not found in Commons Api data: " + owner_uid);
    }
    itemMongoData.owner = owner._id;
  }
  return itemMongoData;
};
const createSlotData = function(slotData, item, project, locations) {
  let { status, start, end, location_uid } = slotData;
  const location = locations[location_uid];
  if (!location) {
    throw new Error("Location not found in Commons Api data: " + location_uid);
  }
  return {
    location: location._id,
    project: project._id,
    item: item._id,
    status,
    start: new Date(start),
    end: new Date(end)
  };
};
const sendNewProjectNotification = function(project) {
  // setup e-mail data with unicode symbols
  var mailOptions = {
    to: mailRecipients, // list of receivers
    subject: "New Commons Booking Instance", // Subject line
    text: `Hello Commons Booking Hub Admin!\n>
I have just imported data from a new Commons Booking instance:\n
Name: ${project.name}\n
URL: ${project.url}\n
If you want to block data from this site, please visit the blacklist in the admin area\n
Cheers, your Commons Booking Hub`,
    html: `
<h1>Hello Commons Booking Hub Admin!</h1>
<p>I have just imported data from a new Commons Booking instance:</p>
<table><tr><td>Name: ${project.name}</td><td>URL: ${
      project.url
    }</td></tr></table>
<p>If you want to block data from this site, please visit the blacklist in the admin area</p>
<p>Cheers, your Commons Booking Hub</p>`
  };
  agenda.now(EMAIL, mailOptions, function(error) {
    if (error) {
      logger.error(error);
    }
  });
};
const removeProjectData = async function(projectId) {
  const removalPromises = [];
  removalPromises.push(COwner.deleteMany({ project: projectId }));
  removalPromises.push(CItem.deleteMany({ project: projectId }));
  removalPromises.push(CLocation.deleteMany({ project: projectId }));
  removalPromises.push(CSlot.deleteMany({ project: projectId }));
  await Promise.all(removalPromises);
};
const unescapeSlashes = url => {
  return url.replace(/\\\//g, "/");
};
const reduceToUidDictionary = (acc, curr) => {
  acc[curr.uid] = curr;
  return acc;
};

module.exports = {
  importFromCommonsApiEndpoint: importFromCommonsApiEndpoint,
  importAllProjects: importAllProjects,
  importJson: importJson
};
