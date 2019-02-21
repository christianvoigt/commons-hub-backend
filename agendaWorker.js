const logger = require("./utils/logger");
//const { MongoClient } = require('mongodb');
require("dotenv").config({ path: __dirname + "/.env" });

const agenda = require("./utils/agenda");
const jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(",") : [];

/**
 * Attempt to unlock Agenda jobs that were stuck due server restart
 * See https://github.com/agenda/agenda/issues/410
 */
const unlockAgendaJobs = async function(agenda) {
  if (process.env.NODE_ENV !== "test") {
    logger.info("[Worker] Attempting to unlock locked Agenda jobs...");
  }

  // Re-use Agenda's MongoDB connection
  var agendaJobs = agenda._mdb.collection("jobs");

  await agendaJobs.update(
    {
      lockedAt: {
        $exists: true
      },
      lastFinishedAt: {
        $exists: false
      }
    },
    {
      $unset: {
        lockedAt: undefined,
        lastModifiedBy: undefined,
        lastRunAt: undefined
      },
      $set: {
        nextRunAt: new Date()
      }
    },
    {
      multi: true
    }
  );
};

async function start() {
  //const db = await MongoClient.connect(mongoConnectionString);

  jobTypes.forEach(function(type) {
    require("./jobs/" + type.trim()).default(agenda);
  });

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once("ready", resolve));
  await unlockAgendaJobs(agenda);
  //agenda.every("1 hour", "import-data");
  agenda.start();
  /**
   * Gracefully exit Agenda
   */
  function gracefulExit() {
    logger.info("[Worker] Stopping Agenda...");
    agenda.stop(function() {
      logger.info("[Worker] Agenda stopped.");
      process.exit(0);
    });
  }
  process.on("SIGTERM", gracefulExit);
  process.on("SIGINT", gracefulExit);
  return agenda;
}

module.exports = { start };
