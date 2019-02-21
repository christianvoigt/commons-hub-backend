const Agenda = require("agenda");
const logger = require("./logger");
//const { MongoClient } = require('mongodb');
require("dotenv").config({ path: __dirname + "/../.env" });

const mongo_username = process.env.MONGODB_AGENDA_USERNAME;
const mongo_password = process.env.MONGODB_AGENDA_PASSWORD;
const mongo_dbname = process.env.MONGODB_DBNAME;
const mongo_port = process.env.MONGODB_PORT;
const mongo_host = process.env.MONGODB_HOST;
const mongoConnectionString = `mongodb://${mongo_username}:${mongo_password}@${mongo_host}:${mongo_port}/${mongo_dbname}?authSource=admin`;

var agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: "jobs",
    options: { useNewUrlParser: true }
  }
});
module.exports = agenda;
