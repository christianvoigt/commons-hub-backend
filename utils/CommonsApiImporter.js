const agenda = require("./agenda.js");
const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const CDataSource = require("../models/CDataSource");
const CProject = require("../models/CProject");
const CItem = require("../models/CItem");
const CSlot = require("../models/CSlot");
const COwner = require("../models/COwner");
const CLocation = require("../models/CLocation");
const logger = require("./logger");
const EMAIL = require("../jobs/EMAIL").EMAIL;
require("dotenv").config({ path: __dirname + "/../.env" });
const mailRecipients = process.env.ADMIN_EMAIL_ADRESSES;
const validate = require("./SchemaValidator");

const maxContentLength = process.env.IMPORT_MAX_CONTENT_LENGTH || 500000; // default is 500 kb

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const importFromSource = async function(params) {
    let url = params.url;
    // importFromSource should never throw any errors, so we will catch them all.
    try {
        logger.info(`Trying to import data from url: ${url}`);
        if (process.env.NODE_ENV === "development") {
            logger.info(`Replacing localhost with host.docker.internal`);
            url = url.replace("localhost", "host.docker.internal");
        }
        let source = null;
        source = await CDataSource.findOne({ url: params.url }).exec();
        if (source && source.isBlocked) {
            logger.info("Aborting import, source is blocked.");
            return false;
        }
        const itemId = params.itemId;
        const updateAvailability = true; // for now, always update availability to avoid outdated _ids in slots
        const updateLocations = !source || !!params.updateLocations;
        const updateOwners = !source || !!params.updateOwners;
        const updateProjects = !source || !!params.updateProjects;
        const updateItems = !source || !!params.updateItems;
        if (itemId != null && updateAvailability) {
            url = url + "/availability" + itemId;
        } else {
            url =
                url +
                `/items?availability=${updateAvailability}&locations=${updateLocations}&owners=${updateOwners}&projects=${updateProjects}`;
        }
        try {
            const response = await axios.get(url, { maxContentLength });
            const json = response.data;
            await importJson(json, {
                url: params.url,
                itemId,
                source,
                updateItems,
                updateAvailability,
                updateLocations,
                updateOwners,
                updateProjects,
                sendNotification: true
            });

            logger.info("Successfully finished importing data from: " + url);
        } catch (error) {
            if (source) {
                // Update number of failed requests. If it is >= 3, delete data source
                source.failedRequests++;
                if (source.failedRequests >= 3) {
                    await deleteDataSource(source);
                } else {
                    await source.save();
                }
            }
            if (error.response) {
                /*
                 * The request was made and the server responded with a
                 * status code that falls out of the range of 2xx
                 */
                const e = new Error(
                    "Commons api endpoint responded with error: " +
                        error.response.status
                );
                e.name = error.response.status;
                e.remoteHostname = url;
                e.headers = error.response.headers;
                // e.data = error.response.data;
                throw e;
            } else if (error.request) {
                /*
                 * The request was made but no response was received, `error.request`
                 * is an instance of XMLHttpRequest in the browser and an instance
                 * of http.ClientRequest in Node.js
                 */
                const e = new Error(
                    "Commons api endpoint not found: " + error.request
                );
                e.name = "EndpointNotFound";
                e.remoteHostname = url;
                throw e;
            } else {
                // Something happened in setting up the request and triggered an Error
                const e = new Error("Commons api request failed: " + error);
                e.name = "ImportError";
                e.remoteHostname = url;
                throw e;
            }
        }
    } catch (error) {
        logger.error(error);
        return false;
    }
};
const importJson = async function(
    json,
    {
        itemId,
        source,
        url,
        updateItems,
        updateLocations,
        updateAvailability,
        updateOwners,
        updateProjects,
        sendNotification = true
    }
) {
    // Delete all data of this source if publishOnVelogistics is no longer true
    if (!itemId && !json.publishOnVelogistics) {
        // single item availability updates will not use the /items route. Only the items route uses the publishOnVelogistics flag
        if (source) {
            await deleteDataSource(source);
        }
        return;
    }
    // Data validation
    if (itemId && updateAvailability) {
        if (!validate.availability(json)) {
            const e = new Error(
                "Invalid Commons Api availability data: \n" +
                    JSON.stringify(validate.availability.errors)
            );
            e.name = "InvalidCommonsApiData";
            e.propertyName = "site";
            e.remoteHostname = url;
            throw e;
        }
    } else {
        if (!validate.items(json)) {
            const e = new Error(
                "Invalid Commons Api items data: \n" +
                    JSON.stringify(validate.items.errors)
            );
            e.name = "InvalidCommonsApiData";
            e.propertyName = "site";
            e.remoteHostname = url;
            throw e;
        }
    }
    // Creating new data
    const isNotRegistered = !source;
    if (isNotRegistered) {
        source = createDataSource(url);
    }
    let owners = null;
    if (updateOwners && json.owners) {
        owners = json.owners.map(data => createOwner(source._id, data));
    } else if (updateItems) {
        owners = await COwner.find({ source: source._id }).exec();
    }
    let projects = null;
    if (updateProjects && json.projects) {
        projects = json.projects.map(data => createProject(source._id, data));
    } else if (updateItems) {
        projects = await CProject.find({ source: source._id }).exec();
    }
    let items = null;
    if (!itemId && json.items) {
        items = json.items.map(data =>
            createItem(source._id, data, projects, owners)
        );
    } else if (updateAvailability) {
        let itemQuery = { source: source._id };
        if (itemId) {
            itemQuery.originalId = itemId;
        }
        items = await CItem.find(itemQuery).exec();
    }
    let locations = null;
    if (updateLocations && json.locations && json.locations.features) {
        locations = json.locations.features.map(data =>
            createLocation(source._id, data)
        );
    } else if (updateAvailability) {
        locations = await CLocation.find({ source: source._id }).exec();
    }
    let slots = null;
    if (updateAvailability && json.availability) {
        slots = json.availability.map(data =>
            createSlot(source._id, data, items, locations)
        );
    }

    // Deleting old data
    const deletePromises = [];
    if (!itemId && updateOwners && owners) {
        deletePromises.push(deleteOwners(source._id));
    }
    if (!itemId && updateItems && items) {
        deletePromises.push(deleteItems(source._id));
    }
    if (!itemId && updateAvailability && slots) {
        deletePromises.push(deleteSlots(source._id));
    }
    if (!itemId && updateLocations && locations) {
        deletePromises.push(deleteLocations(source._id));
    }
    if (!itemId && updateProjects && projects) {
        deletePromises.push(deleteProjects(source._id));
    }
    if (itemId && updateAvailability) {
        items.find(i => i.originalId === itemId);
        deletePromises.push(CSlot.removeMany({ item: item._id }));
    }
    await Promise.all(deletePromises);

    //Saving new data
    const insertPromises = [];
    if (isNotRegistered) {
        source.created = moment.now();
    }
    source.changed = moment.now();
    source.failedRequests = 0;
    insertPromises.push(source.save());
    if (updateOwners && owners) {
        insertPromises.push(COwner.insertMany(owners));
    }
    if (updateProjects && projects) {
        insertPromises.push(CProject.insertMany(projects));
    }
    if (updateLocations && locations) {
        insertPromises.push(CLocation.insertMany(locations));
    }
    if (updateItems && items) {
        insertPromises.push(CItem.insertMany(items));
    }
    if (updateAvailability && slots) {
        insertPromises.push(CSlot.insertMany(slots));
    }
    await Promise.all(insertPromises);
    if (sendNotification && isNotRegistered) {
        sendNewProjectNotification(source);
    }
    return true;
};
const createDataSource = function(url) {
    return new CDataSource({
        url: encodeURI(unescapeSlashes(url))
    });
};
const reimportAllSources = async function() {
    var hrstart = process.hrtime();
    const sources = await CDataSource.find()
        .select("url")
        .exec();
    const promises = [];
    if (sources && sources.length > 0) {
        logger.info(`Reimporting ${sources.length} sources...`);
        for (var source of sources) {
            promises.push(
                importFromSource({
                    url: source.url,
                    updateItems: true,
                    updateLocations: true,
                    updateOwners: true,
                    updateProjects: true,
                    updateAvailability: true
                })
            );
        }
    } else {
        logger.info("Reimport job did not find any registered sources.");
    }
    await Promise.all(promises);
    hrend = process.hrtime(hrstart);
    logger.info(
        `Finished reimporting all sources. Execution time: ${
            hrend[0]
        }s ${hrend[1] / 1000000}ms`
    );
};
const createProject = function(sourceId, projectData) {
    let { id, name, url, description } = projectData;
    return new CProject({
        _id: new mongoose.mongo.ObjectId(),
        name,
        source: sourceId,
        originalId: id,
        url: encodeURI(unescapeSlashes(url)),
        description
    });
};

const createLocation = function(sourceId, locationData) {
    let { name, description, address, id, url } = locationData.properties;
    let { coordinates } = locationData.geometry;
    return {
        _id: new mongoose.mongo.ObjectId(),
        name,
        description,
        address,
        originalId: id,
        url: encodeURI(unescapeSlashes(url)),
        geometry: { type: "Point", coordinates },
        source: sourceId
    };
};
const createOwner = function(sourceId, ownerData) {
    let { name, description, id, url } = ownerData;
    return {
        _id: new mongoose.mongo.ObjectId(),
        name,
        originalId: id,
        description,
        url: encodeURI(unescapeSlashes(url)),
        source: sourceId
    };
};
const createItem = function(sourceId, itemData, projects, owners) {
    let {
        name,
        description,
        id,
        url,
        ownerId,
        projectId,
        itemType,
        features,
        isCommercial,
        nrOfWheels,
        seatsForChildren,
        loadCapacity,
        boxDimensions,
        bikeDimensions
    } = itemData;
    const item = {
        _id: new mongoose.mongo.ObjectId(), // we create the id here so that we can use it in the slot data
        name,
        description,
        originalId: id,
        source: sourceId,
        url: encodeURI(unescapeSlashes(url)),
        itemType: itemType,
        isCommercial: isCommercial,
        nrOfWheels: nrOfWheels,
        seatsForChildren: seatsForChildren,
        loadCapacity: loadCapacity,
        features: features,
        boxDimensions: {
            width: boxDimensions.width,
            height: boxDimensions.height,
            length: boxDimensions.length
        },
        bikeDimenions: {
            width: bikeDimensions.width,
            height: bikeDimensions.height,
            length: bikeDimensions.length
        }
    };
    if (ownerId) {
        const owner = owners.find(o => o.originalId === ownerId);
        if (!owner) {
            throw new Error("Owner not found in Commons Api data: " + ownerId);
        }
        item.owner = owner._id;
    }
    if (projectId) {
        const project = projects.find(p => p.originalId === projectId);
        if (!project) {
            throw new Error(
                "Project not found in Commons Api data: " + projectId
            );
        }
        item.project = project._id;
    }
    return item;
};
const createSlot = function(sourceId, slotData, items, locations) {
    let { start, end, locationId, itemId } = slotData;
    const location = locations.find(
        location => location.originalId === locationId
    );
    if (!location) {
        throw new Error(
            "Location not found in Commons Api data: " + locationId
        );
    }
    const item = items.find(i => i.originalId === itemId);
    if (!item) {
        throw new Error(`Item not found in Commons Api data: ${itemId}`);
    }

    return {
        location: location._id,
        source: sourceId,
        item: item._id,
        start: new Date(start),
        end: new Date(end)
    };
};
const sendNewProjectNotification = function(source) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        to: mailRecipients, // list of receivers
        subject: "New Commons Booking Instance", // Subject line
        text: `Hello Commons Booking Hub Admin!\n>
I have just imported data from a new Commons API data source:\n
 ${source.url}\n\n
If you want to block data from this site, please visit the blacklist in the admin area\n
Cheers, your Commons Booking Hub`,
        html: `
<h1>Hello Commons Booking Hub Admin!</h1>
<p>I have just imported data from a new Commons Booking instance:</p>
<p>URL: <a href="${source.url}">${source.url}</p>
<p>If you want to block data from this site, please visit the blacklist in the admin area</p>
<p>Cheers, your Commons Booking Hub</p>`
    };
    agenda.now(EMAIL, mailOptions, function(error) {
        if (error) {
            logger.error(error);
        }
    });
};
const deleteDataSource = async function(source) {
    const deleteAllPromises = [
        deleteItems(source._id),
        deleteLocations(source._id),
        deleteOwners(source._id),
        deleteProjects(source._id),
        deleteSlots(source._id),
        CDataSource.deleteOne({ _id: source._id }).exec()
    ];
    await Promise.all(deleteAllPromises);
    logger.info(`Removed data source: ${source.url}`);
};
const deleteItems = function(sourceId) {
    return CItem.deleteMany({ source: sourceId }).exec();
};
const deleteProjects = function(sourceId) {
    return CProject.deleteMany({ source: sourceId }).exec();
};
const deleteOwners = function(sourceId) {
    return COwner.deleteMany({ source: sourceId }).exec();
};
const deleteLocations = function(sourceId) {
    return CLocation.deleteMany({ source: sourceId }).exec();
};
const deleteSlots = function(sourceId) {
    return CSlot.deleteMany({ source: sourceId }).exec();
};
const unescapeSlashes = url => {
    return url.replace(/\\\//g, "/");
};
const reduceToUidDictionary = (acc, curr) => {
    acc[curr.uid] = curr;
    return acc;
};

module.exports = {
    importFromSource: importFromSource,
    reimportAllSources: reimportAllSources,
    importJson: importJson
};
