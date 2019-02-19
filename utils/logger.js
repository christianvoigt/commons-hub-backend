const winston = require("winston");
const path = require("path");
const mkdirp = require("mkdirp");
winston.emitErrs = true;

const logFolderPath = path.join(__dirname, "../logs");
mkdirp.sync(logFolderPath);

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: "info",
      filename: path.join(__dirname, "../logs/all-logs.log"),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});
module.exports = logger;
module.exports.stream = {
  write: function(message) {
    logger.info(message);
  }
};
