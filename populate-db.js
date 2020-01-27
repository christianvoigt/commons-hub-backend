const faker = require("faker");
const logger = require("./utils/logger");
const moment = require("moment");
var metadata = require("./node_modules/commons-api/velogistics-metadata.json");
require("dotenv").config({ path: __dirname + "/.env" });

logger.info(
    "Velogistics DB Population: This script populates some test items, slots, locations, owners, projects to your database. It uses environment variables to create a url to your mongo database."
);

var mongo_username = process.env.MONGODB_EXPRESS_USERNAME || "admin";
var mongo_password = process.env.MONGODB_EXPRESS_PASSWORD;
var mongo_dbname = process.env.MONGODB_DBNAME;
var mongo_port = process.env.MONGODB_PORT;
var mongo_host = process.env.MONGODB_HOST;
var mongoURL = `mongodb://${mongo_username}:${mongo_password}@${mongo_host}:${mongo_port}/${mongo_dbname}?authSource=admin`;

var CItem = require("./models/CItem");
var CDataSource = require("./models/CDataSource");
var CProject = require("./models/CProject");
var COwner = require("./models/COwner");
var CSlot = require("./models/CSlot");
var CLocation = require("./models/CLocation");

var sources = [];
var items = [];
var owners = [];
var projects = [];
var locations = [];

var mongoose = require("mongoose");
mongoose.connect(mongoURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on(
    "error",
    logger.error.bind(logger, "MongoDB connection error:")
);

async function removeOldData() {
    logger.info("Removing old data...");
    const removePromises = [];
    removePromises.push(CDataSource.deleteMany({}));
    removePromises.push(CLocation.deleteMany({}));
    removePromises.push(CSlot.deleteMany({}));
    removePromises.push(COwner.deleteMany({}));
    removePromises.push(CProject.deleteMany({}));
    removePromises.push(CItem.deleteMany({}));
    removePromises.push(CSlot.deleteMany({}));
    await Promise.all(removePromises);
    logger.info("Data successfully removed.");
}

async function itemCreate(source, name, owner, project, url, nrOfSlots) {
    const features = [];
    for (var i = 0; i < getRandomInt(0, 6); i++) {
        features.push(getRandomElement(metadata.features).id);
    }
    const itemdetail = {
        name: name,
        description: faker.lorem.paragraph(),
        owner: owner._id,
        source: source._id,
        project: project._id,
        originalId: "asdfasdasf",
        url: url,
        itemType: getRandomElement(metadata.itemType).id,
        features,
        isCommercial: getRandomElement([true, false]),
        loadCapacity: getRandomInt(1, 50),
        boxDimensions: {
            width: getRandomInt(1, 4),
            length: getRandomInt(1, 4),
            height: getRandomInt(1, 4)
        }
    };
    var item = new CItem(itemdetail);
    await item.save();
    await createSlots(source, item, nrOfSlots);
    items.push(item);
}

async function ownerCreate(source, name) {
    const ownerdetail = {
        name: name,
        source: source._id,
        originalId: "test",
        url: "http://www.spiegel.de"
    };

    var owner = new COwner(ownerdetail);
    await owner.save();
    owners.push(owner);
}

async function projectCreate(source, name) {
    const projectdetail = {
        name: name,
        source: source._id,
        originalId: "asdasd",
        url: "http://www.spiegel.de"
    };

    var project = new CProject(projectdetail);
    await project.save();
    projects.push(project);
}
async function sourceCreate(url) {
    const sourcedetail = {
        url: url
    };

    var source = new CDataSource(sourcedetail);
    await source.save();
    sources.push(source);
}

async function locationCreate(
    source,
    name,
    description,
    address,
    url,
    originalId,
    coordinates
) {
    var location = new CLocation({
        name: name,
        source: source._id,
        description,
        address,
        url,
        originalId: originalId,
        geometry: {
            type: "Point",
            coordinates: coordinates
        }
    });
    await location.save();
    locations.push(location);
}

// async function createCategories() {
//   logger.info("Creating Categories...");
//   await Promise.all([
//     categoryCreate("Bäckerrad"),
//     categoryCreate("Dreirad (Christiania-Bike)"),
//     categoryCreate("Long John"),
//     categoryCreate("Verlängertes Heck"),
//     categoryCreate("Massiver Gepäckträger und Korb")
//   ]);
// }
async function createSources() {
    logger.info("Creating Sources...");
    await Promise.all([sourceCreate("http://www.spiegel.de")]);
    await Promise.all([sourceCreate("http://nytimes.com")]);
}
async function createProjects() {
    logger.info("Creating Projects...");
    await Promise.all([
        projectCreate(sources[0], "p1", "http://www.spiegel.de")
    ]);
    await Promise.all([projectCreate(sources[0], "p2", "http://nytimes.com")]);
}
async function createOwners(nrOfOwners) {
    logger.info("Creating Owners...");
    const promises = [];
    for (var i = 0; i < nrOfOwners; i++) {
        promises.push(ownerCreate(sources[0], faker.name.findName()));
    }
    await Promise.all(promises);
}

async function createLocations(nrOfLocations) {
    logger.info("Creating Locations");
    const promises = [];
    for (var i = 0; i < nrOfLocations; i++) {
        promises.push(
            locationCreate(
                sources[0],
                faker.name.findName(),
                faker.lorem.paragraph(3),
                `${faker.address.streetAddress()}, ${faker.address.city()} ${faker.address.zipCode()}, ${faker.address.country()}`,
                faker.internet.url(),
                "adasd",
                getCoordinates()
            )
        );
    }
    await Promise.all(promises);
}

async function createSlots(source, item, nrOfSlots) {
    const promises = [];
    const slots = [];
    let start = moment().startOf("day");
    for (var i = 0; i < nrOfSlots; i++) {
        const end = moment(start).add(1, "day");
        slots.push({
            source: source._id,
            item: item._id,
            statusName: getRandomElement([
                "available",
                "available",
                "available",
                "booked",
                "repair",
                "holiday"
            ]),
            statusId: getRandomInt(0, 4),
            start: start,
            end: end,
            location: getRandomElement(locations)._id
        });
        start = end;
    }
    return await CSlot.insertMany(slots);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomElement(arr) {
    var index = getRandomInt(0, arr.length - 1);
    return arr[index];
}
function getCoordinates() {
    const long = 13 + (Math.random() * 3 - 1.5);
    const lat = 52 + (Math.random() * 3 - 1.5);
    return [long, lat];
}
async function createItems(nrOfItems, nrOfSlots) {
    logger.info("Creating Items...");
    const promises = [];
    for (var i = 0; i < nrOfItems; i++) {
        var owner = owners[getRandomInt(0, owners.length - 1)];
        promises.push(
            itemCreate(
                sources[0],
                faker.commerce.productName(),
                owner,
                projects[0],
                faker.internet.url(),
                nrOfSlots
            )
        );
    }
    await Promise.all(promises);
}
async function main() {
    const nrOfOwners = 50;
    const nrOfLocations = 40;
    const nrOfItems = 100;
    const nrOfSlots = 20; // per item

    try {
        //Clear db
        if (process.env.MONGODB_CLEAR_DB != "false") {
            await removeOldData();
        }
        if (process.env.MONGODB_POPULATE_DB != "false") {
            await createSources();
            await createProjects();
            await createOwners(nrOfOwners);
            await createLocations(nrOfLocations);
            await createItems(nrOfItems, nrOfSlots);
        }
        mongoose.connection.close();
    } catch (e) {
        logger.error(e);
    }
}
main();
