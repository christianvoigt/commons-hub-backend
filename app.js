var express = require("express");
var path = require("path");
// var favicon = require('serve-favicon');
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoSanitize = require("express-mongo-sanitize");
var logger = require("./utils/logger");
var expressSession = require("express-session");
var passwordless = require("passwordless");
var MongoStore = require("passwordless-mongostore");
var compression = require("compression");
var helmet = require("helmet");

var itemRoutes = require("./routes/item");
var indexRoutes = require("./routes/index");
var slotRoutes = require("./routes/slot");
var locationRoutes = require("./routes/location");
var agenda = require("./worker.js");
var EMAIL = require("./jobs/EMAIL").EMAIL;
require("dotenv").load();

var app = express();
app.use(compression());
app.use(helmet());

//Set up mongoose connection
var mongo_username = process.env.MONGODB_EXPRESS_USERNAME || "admin";
var mongo_password = encodeURIComponent(process.env.MONGODB_EXPRESS_PASSWORD);
var mongo_dbname = process.env.MONGODB_DBNAME;
var mongo_port = process.env.MONGODB_PORT;
var mongo_host = process.env.MONGODB_HOST;
const basePath = process.env.EXPRESS_BASE_PATH || "";
const host = process.env.EXPRESS_HOST;
const expressPort = process.env.EXPRESS_PORT || 3000;
const siteUrl = host + basePath;

var mongoose = require("mongoose");
var mongoURL = `mongodb://${mongo_username}:${mongo_password}@${mongo_host}:${mongo_port}/${mongo_dbname}?authSource=admin`;
mongoose.connect(mongoURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", logger.error.bind(logger, "MongoDB connection error:"));

// Setup of Passwordless
passwordless.init(new MongoStore(mongoURL, { useNewUrlParser: true }));
passwordless.addDelivery(
  function(tokenToSend, uidToSend, recipient, callback) {
    // setup e-mail data with unicode symbols
    const uidToSendEnc = encodeURIComponent(uidToSend);
    var mailOptions = {
      from: '"Velogistics Server ?" <velogistics-server@outlook.de>', // sender address
      to: recipient, // list of receivers
      subject: "Token for Velogistics", // Subject line
      text: `Hello Commons Booking Hub Admin!\nYou can now access your account here: ${siteUrl}/admin?token=${tokenToSend}&uid=${uidToSendEnc}`,
      html: `<h1>Hello Commons Booking Hub Admin!</h1><p>You can now access your account by clicking on <a href="${siteUrl}/admin?token=${tokenToSend}&uid=${uidToSendEnc}">this link</a>.<p>Greetings, your Commons Booking Hub!</p></p>`
    };
    agenda.now(EMAIL, mailOptions, function(error) {
      if (error) {
        logger.error(error);
      }
      callback(error);
    });
  },
  { ttl: 1000 * 60 * 60 * 24 }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.locals.basePath = basePath;
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(require("morgan")("combined", { stream: logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// config express-session
var sess = {
  secret: process.env.EXPRESS_SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
};

// The following is the recommended setting on https connections, but did not work on uberspace 6:
// if (app.get("env") === "production") {
//   sess.cookie.secure = true; // serve secure cookies, requires https
// }

app.use(expressSession(sess));

app.use(function(req, res, next) {
  if (req.user) {
    res.locals.user = req.user;
    next();
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// Passwordless middleware
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: basePath + "/admin" }));

app.use(
  mongoSanitize({
    replaceWith: "_"
  })
);

app.use("/", indexRoutes);
app.use("/item", itemRoutes);
app.use("/slot", slotRoutes);
// catch 404 and forward to error handler
app.use("/location", locationRoutes);
app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
});
// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
