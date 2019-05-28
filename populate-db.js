const faker = require("faker");
const logger = require("./utils/logger");
const moment = require("moment");
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
var CProject = require("./models/CProject");
var COwner = require("./models/COwner");
var CSlot = require("./models/CSlot");
var CLocation = require("./models/CLocation");

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
    removePromises.push(CLocation.deleteMany({}));
    removePromises.push(CSlot.deleteMany({}));
    removePromises.push(COwner.deleteMany({}));
    removePromises.push(CProject.deleteMany({}));
    removePromises.push(CItem.deleteMany({}));
    removePromises.push(CSlot.deleteMany({}));
    await Promise.all(removePromises);
    logger.info("Data successfully removed.");
}

async function itemCreate(name, owner, project, url, nrOfSlots) {
    const itemdetail = {
        name: name,
        description: faker.lorem.paragraph(),
        owner: owner._id,
        project: project._id,
        uid: "asdfasdasf",
        url: url,
        canTransportChildren: getRandomElement([true, false]),
        maxTransportWeight: getRandomInt(1, 1000),
        nrOfWheels: getRandomInt(1, 12)
    };
    var item = new CItem(itemdetail);
    await item.save();
    await createSlots(item, project, nrOfSlots);
    items.push(item);
}

async function ownerCreate(name, project) {
    const ownerdetail = {
        name: name,
        project: project._id,
        uid: "test",
        url: "http://www.spiegel.de"
    };

    var owner = new COwner(ownerdetail);
    await owner.save();
    owners.push(owner);
}

async function projectCreate(name, url) {
    const projectdetail = {
        name: name,
        endpoint: url,
        url: url,
        uid: "asdasd"
    };

    var project = new CProject(projectdetail);
    await project.save();
    projects.push(project);
}

async function locationCreate(
    name,
    description,
    address,
    url,
    uid,
    project,
    coordinates
) {
    var location = new CLocation({
        name: name,
        description,
        address,
        url,
        uid: uid,
        project: project._id,
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

async function createProjects() {
    logger.info("Creating Projects...");
    await Promise.all([projectCreate("p1", "http://www.spiegel.de")]);
    await Promise.all([projectCreate("p2", "http://nytimes.com")]);
}
async function createOwners(nrOfOwners) {
    logger.info("Creating Owners...");
    const promises = [];
    for (var i = 0; i < nrOfOwners; i++) {
        promises.push(ownerCreate(faker.name.findName(), projects[0]));
    }
    await Promise.all(promises);
}

async function createLocations(nrOfLocations) {
    logger.info("Creating Locations");
    const promises = [];
    for (var i = 0; i < nrOfLocations; i++) {
        promises.push(
            locationCreate(
                faker.name.findName(),
                faker.lorem.paragraph(3),
                `${faker.address.streetAddress()}, ${faker.address.city()} ${faker.address.zipCode()}, ${faker.address.country()}`,
                faker.internet.url(),
                "adasd",
                getRandomElement(projects),
                [faker.address.latitude(), faker.address.longitude()]
            )
        );
    }
    await Promise.all(promises);
}

async function createSlots(item, project, nrOfSlots) {
    const promises = [];
    const slots = [];
    let start = moment();
    for (var i = 0; i < nrOfSlots; i++) {
        const end = moment(start).add(1, "day");
        slots.push({
            item: item._id,
            status: getRandomElement([
                "available",
                "available",
                "available",
                "booked",
                "repair",
                "holiday"
            ]),
            start: start,
            end: end,
            location: getRandomElement(locations)._id,
            project: project._id
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
async function createItems(nrOfItems, nrOfSlots) {
    logger.info("Creating Items...");
    const promises = [];
    for (var i = 0; i < nrOfItems; i++) {
        var owner = owners[getRandomInt(0, owners.length - 1)];
        promises.push(
            itemCreate(
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
        if (process.env.MONGODB_POPULATE_DB) {
            //Clear db
            if (process.env.MONGODB_CLEAR_DB) {
                await removeOldData();
            }
            // await createProjects();
            // await createOwners(nrOfOwners);
            // await createLocations(nrOfLocations);
            // await createItems(nrOfItems, nrOfSlots);
            mongoose.connection.close();
        }
    } catch (e) {
        logger.error(e);
    }
}
main();
