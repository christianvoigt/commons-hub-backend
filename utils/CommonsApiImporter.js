const axios = require("axios");
const mongoose = require("mongoose");
const CProject = require("../models/CProject");
const CItem = require("../models/CItem");
const COwner = require("../models/COwner");
const CLocation = require("../models/CLocation");
const agenda = require("../worker");
const mailRecipients = process.env.ADMIN_EMAIL_ADDRESSES;
const logger = require("./logger");
const EMAIL = require("../jobs/EMAIL").EMAIL;
const commonsApiSource = require("../node_modules/commons-api/commons-api.schema.json");
const velogisticsApiSource = require("../node_modules/commons-api/velogistics-api.schema.json");
const Ajv = require("ajv");
const ajv = new Ajv();
require('dotenv').config({path: __dirname + '/.env'});

ajv.addMetaSchema(
  require("../node_modules/ajv/lib/refs/json-schema-draft-06.json")
);
ajv.addSchema(commonsApiSource);
ajv.addSchema(velogisticsApiSource, "velogistics-api");
const validate = ajv.getSchema("velogistics-api");

const maxContentLength = process.env.IMPORT_MAX_CONTENT_LENGTH || 20000; // default is 20 kb

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
  // .toFixed() returns string, so ' * 1' is a trick to convert to number
}

var importFromCommonsApiEndpoint = async function(url) {
  // importFromUrl should never throw any errors, so we will catch them all.
  try {
    logger.info(`Trying to import data from url: ${url}`);
    var project = null;
    let isNewProject = false;
    // if (isLocalhost) {
    //   url = url.replace("localhost", "docker.for.mac.localhost");
    // }
    project = await CProject.findOne({ url: url });
    if (project && project.is_blocked) {
      logger.info("Aborting import, site is blocked.");
      return false;
    }
    const response = await axios.get(url, {
      maxContentLength: maxContentLength
    });

    if (!response) {
      const e = new Error("Commons api endpoint not found.");
      e.name = "EndpointNotFound";
      e.propertyName = "site";
      e.remoteHostname = url;
      throw e;
    }
    if (!validate(response.data)) {
      const e = new Error("Invalid Commons Api data: \n" + validate.errors);
      e.name = "InvalidCommonsApiData";
      e.propertyName = "site";
      e.remoteHostname = url;
      throw e;
    }

    if (!project) {
      isNewProject = true;
      const data = response.data;
      project = createProject(data.project);
    } else {
      removeProjectData(project);
      project.name = data.project.name;
      if (data.project.description) {
        project.description = data.project.description;
      }
    }
    const locationDataArray = data.locations.map(l =>
      createLocationData(l, project)
    );
    const ownerDataArray = data.owners.map(o => createOwnerData(o, project));
    let locations, owners;
    try {
      const ownerAndLocationPromises = [
        CLocation.insertMany(locationDataArray),
        COwner.insertMany(ownerDataArray),
        project.save()
      ];
      let ownerAndLocationResults = await Promise.all(ownerAndLocationPromises);
      locations = ownerAndLocationResults[0].reduce(reduceToUidDictionary, {});
      owners = ownerAndLocationResults[1].reduce(reduceToUidDictionary, {});
    } catch (e) {
      logger.info(
        "Aborting import, error in project, location or owner data: " + e
      );
      return false;
    }

    if (isNewProject) {
      sendNewProjectNotification(project);
    }

    const itemDataArray = data.items.map(i =>
      createItemData(i, project, owners, locations)
    );
    const slotDataArray = [];
    data.items.forEach(i => {
      i.availability.reduce((acc, curr) => {
        acc.push(createSlotData(curr, i, project, locations));
        return acc;
      }, slotDataArray);
    });
    try {
      const itemAndSlotPromises = [
        CItem.insertMany(itemDataArray),
        CSlot.inserMany(slotDataArray)
      ];
      await Promise.all(itemAndSlotPromises);
    } catch (e) {
      logger.info("Failed import, error in item data: " + e);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

const importAllProjects = async function() {
  logger.info("Updating all CB instances...");
  const projects = await CProject.find()
    .select("url")
    .exec();
  const promises = [];
  if (projects) {
    for (var project of projects) {
      promises.push(importFromCommonsApiEndpoint(project.url));
    }
  }
  await Promise.all(promises);
  logger.info("Finished updating all CB instances...");
};
const createProject = function(projectData) {
  let { name, url, uid, description } = projectData;
  return new CProject({
    name,
    uid,
    url,
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
    url,
    geometry: { type: "Point", coordinates },
    project: project._id
  };
};
const createOwnerData = function(ownerData, project) {
  let { name, description, uid, url } = ownerData;
  return {
    name,
    description,
    uid,
    url,
    project: project._id
  };
};
const createItemData = function(itemData, project, owners, locations) {
  let {
    name,
    description,
    uid,
    url,
    owner_uid,
    nr_of_wheels,
    can_transport_children,
    max_transport_weight
  } = itemData;
  const owner = owners[owner_uid];
  if (!owner) {
    throw new Error("Owner not found in Commons Api data: " + owner_uid);
  }
  return {
    _id: new mongoose.mongo.ObjectId(), // we create the id here so that we can use it in the slot data
    name,
    description,
    uid,
    url,
    project: project._id,
    owner: owner._id,
    nrOfWheels: nr_of_wheels,
    canTransportChildren: can_transport_children,
    maxTransportWeigth: max_transport_weight
  };
};
const createSlotData = function(slotData, item, project, locations) {
  let { status, start, end, location_uid } = slotData;
  return {
    location: location_uid,
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
    from: '"Velogistics Server ?" <velogistics-server@outlook.de>', // sender address
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
const removeProjectData = async function(project) {
  const removalPromises = [];
  removalPromises.push(COwner.deleteMany({ project }));
  removalPromises.push(CItem.deleteMany({ project }));
  removalPromises.push(CLocation.deleteMany({ project }));
  await Promise.all(removalPromises);
};
const reduceToUidDictionary = (acc, curr) => {
  acc[curr.id] = curr;
  return acc;
};

module.exports = {
  importFromCommonsApiEndpoint: importFromCommonsApiEndpoint,
  importAllProjects: importAllProjects
};
