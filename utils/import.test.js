var CItem = require("../models/CItem");
var CProject = require("../models/CProject");
var COwner = require("../models/COwner");
var CSlot = require("../models/CSlot");
var CLocation = require("../models/CLocation");
var logger = require("./logger.js");

const importer = require("./CommonsApiImporter.js");
const jsonStr =
  '{"version":"1.0.0","project":{"name":"V","url":"http://localhost/","description":"Just another WordPress site","language":"en_US"},"items":[{"uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=1","name":"Cargo Bike Blue","url":"http://localhost/item/cargo-bike-blue/","owner_uid":"1","availability":[{"status":"available","start":"2019-02-21T09:00:00+00:00","end":"2019-02-21T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-22T09:00:00+00:00","end":"2019-02-22T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-23T09:00:00+00:00","end":"2019-02-23T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-24T09:00:00+00:00","end":"2019-02-24T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-25T09:00:00+00:00","end":"2019-02-25T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-26T09:00:00+00:00","end":"2019-02-26T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-27T09:00:00+00:00","end":"2019-02-27T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-02-28T09:00:00+00:00","end":"2019-02-28T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-01T09:00:00+00:00","end":"2019-03-01T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-02T09:00:00+00:00","end":"2019-03-02T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-03T09:00:00+00:00","end":"2019-03-03T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-04T09:00:00+00:00","end":"2019-03-04T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-05T09:00:00+00:00","end":"2019-03-05T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-06T09:00:00+00:00","end":"2019-03-06T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-07T09:00:00+00:00","end":"2019-03-07T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-08T09:00:00+00:00","end":"2019-03-08T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-09T09:00:00+00:00","end":"2019-03-09T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-10T09:00:00+00:00","end":"2019-03-10T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-11T09:00:00+00:00","end":"2019-03-11T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-12T09:00:00+00:00","end":"2019-03-12T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-13T09:00:00+00:00","end":"2019-03-13T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-14T09:00:00+00:00","end":"2019-03-14T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-15T09:00:00+00:00","end":"2019-03-15T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-16T09:00:00+00:00","end":"2019-03-16T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-17T09:00:00+00:00","end":"2019-03-17T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-18T09:00:00+00:00","end":"2019-03-18T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-19T09:00:00+00:00","end":"2019-03-19T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"},{"status":"available","start":"2019-03-20T09:00:00+00:00","end":"2019-03-20T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3"}],"can_transport_children":false,"max_transport_weight":500,"nr_of_wheels":0},{"uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=2","name":"Cargo Bike Red","url":"http://localhost/item/cargo-bike-red/","owner_uid":"1","availability":[{"status":"available","start":"2019-02-21T09:00:00+00:00","end":"2019-02-21T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-22T09:00:00+00:00","end":"2019-02-22T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-23T09:00:00+00:00","end":"2019-02-23T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-24T09:00:00+00:00","end":"2019-02-24T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-25T09:00:00+00:00","end":"2019-02-25T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-26T09:00:00+00:00","end":"2019-02-26T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-27T09:00:00+00:00","end":"2019-02-27T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-02-28T09:00:00+00:00","end":"2019-02-28T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-01T09:00:00+00:00","end":"2019-03-01T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-02T09:00:00+00:00","end":"2019-03-02T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-03T09:00:00+00:00","end":"2019-03-03T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-04T09:00:00+00:00","end":"2019-03-04T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-05T09:00:00+00:00","end":"2019-03-05T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-06T09:00:00+00:00","end":"2019-03-06T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-07T09:00:00+00:00","end":"2019-03-07T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-08T09:00:00+00:00","end":"2019-03-08T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-09T09:00:00+00:00","end":"2019-03-09T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-10T09:00:00+00:00","end":"2019-03-10T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-11T09:00:00+00:00","end":"2019-03-11T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-12T09:00:00+00:00","end":"2019-03-12T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-13T09:00:00+00:00","end":"2019-03-13T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-14T09:00:00+00:00","end":"2019-03-14T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-15T09:00:00+00:00","end":"2019-03-15T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-16T09:00:00+00:00","end":"2019-03-16T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-17T09:00:00+00:00","end":"2019-03-17T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-18T09:00:00+00:00","end":"2019-03-18T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-19T09:00:00+00:00","end":"2019-03-19T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"},{"status":"available","start":"2019-03-20T09:00:00+00:00","end":"2019-03-20T09:00:00+00:00","location_uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4"}],"can_transport_children":true,"max_transport_weight":0,"nr_of_wheels":0}],"owners":[{"name":"admin","url":"http://localhost/author/admin/","uid":"1"}],"locations":{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=3","name":"Budapest fairest","url":"http://localhost/location/budapest-fairest/","address":"Wiener Stra\u00dfe, Kreuzberg"},"geometry":{"type":"Point","coordinates":[52.498604,13.391799]}},{"type":"Feature","properties":{"uid":"http://commonsbooking.ddns.net/?post_type=item&#038;p=4","name":"Berlin biscuits","url":"http://localhost/location/berlin-biscuits/","address":"Wedding"},"geometry":{"type":"Point","coordinates":[52.5499978,13.3666652]}}]}}';
const json = JSON.parse(jsonStr);
const url = "http://localhost/wp-json/commons-booking-2/v1/items/";
require("dotenv").config({ path: __dirname + "/.env" });

var mongo_username = process.env.MONGODB_EXPRESS_USERNAME || "admin";
var mongo_password = process.env.MONGODB_EXPRESS_PASSWORD;
var mongo_dbname = process.env.MONGODB_DBNAME;
var mongo_port = process.env.MONGODB_PORT;
var mongo_host = process.env.MONGODB_HOST;
var mongoURL = `mongodb://${mongo_username}:${mongo_password}@${mongo_host}:${mongo_port}/${mongo_dbname}?authSource=admin`;
var mongoose = require("mongoose");
mongoose.connect(mongoURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on(
  "error",
  logger.error.bind(logger, "MongoDB connection error:")
);

beforeAll(async done => {
  await removeProjectFromDb(url);
  done();
});
// afterAll(async done => {
//   await removeProjectFromDb(url);
//   mongoose.disconnect();
//   done();
// });
test("validates and imports json Commons Api data into db", async done => {
  await importer.importJson(url, json, false);
  const project = await CProject.findOne({ endpoint: url }).exec();
  expect(project).not.toBeNull();
  const items = await CItem.find({ project: project._id }).exec();
  expect(items.length).toBe(2);
  const locations = await CLocation.find({ project: project._id }).exec();
  expect(locations.length).toBe(2);
  done();
});
const removeProjectFromDb = async url => {
  project = await CProject.findOne({ endpoint: url }).exec();
  if (!project) {
    return;
  }
  const id = project._id;
  const removePromises = [];
  removePromises.push(CLocation.deleteMany({ project: id }));
  removePromises.push(CSlot.deleteMany({ project: id }));
  removePromises.push(COwner.deleteMany({ project: id }));
  removePromises.push(CProject.deleteMany({ _id: id }));
  removePromises.push(CItem.deleteMany({ project: id }));
  removePromises.push(CSlot.deleteMany({ project: id }));
  await Promise.all(removePromises);
};