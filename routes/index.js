var express = require("express");
var router = express.Router();
var passwordless = require("passwordless");
// Require controller modules.
const import_controller = require("../controllers/ImportController");
const admin_controller = require("../controllers/AdminController");
require("dotenv").config({ path: __dirname + "/.env" });
const basePath = process.env.EXPRESS_BASE_PATH || "";
// var instance_controller = require('../controllers/CProjectController');
// var category_controller = require('../controllers/CBCategoryController');
// var owner_controller = require('../controllers/CBOwnerController');
// GET index home page.
router.get("/", function(req, res) {
    res.render("index", { user: req.user });
});

router.get("/notify/", import_controller.notify);

/* GET restricted site. */
router.get(
    "/admin",
    passwordless.restricted({ failureRedirect: basePath + "/login" }),
    admin_controller.admin
);

router.get(
    "/admin/source",
    passwordless.restricted({ failureRedirect: basePath + "/login" }),
    admin_controller.blacklist_get
);
router.get(
    "/admin/item/:itemId",
    passwordless.restricted({ failureRedirect: basePath + "/login" }),
    admin_controller.item
);
router.get(
    "/admin/project/:projectId",
    passwordless.restricted({ failureRedirect: basePath + "/login" }),
    admin_controller.project
);
router.get(
    "/admin/location/:locationId",
    passwordless.restricted({ failureRedirect: basePath + "/login" }),
    admin_controller.location
);
router.get(
    "/admin/source/:sourceId",
    passwordless.restricted({ failureRedirect: basePath + "/login" }),
    admin_controller.source
);

router.post(
    "/admin/source",
    passwordless.restricted(),
    admin_controller.blacklist_post
);

/* GET login screen. */
router.get("/login", function(req, res) {
    res.render("login", { user: req.user });
});

/* GET logout. */
router.get("/logout", passwordless.logout(), function(req, res) {
    res.redirect(basePath + "/");
});

/* POST login screen. */
const adminEmails = process.env.ADMIN_EMAIL_ADRESSES
    ? process.env.ADMIN_EMAIL_ADRESSES.split(",")
    : [];
const admins = [];
var i = 1;
for (var adminEmail of adminEmails) {
    admins.push({ id: i, email: adminEmail.trim().toLowerCase() });
    i++;
}

router.post(
    "/sendtoken",
    passwordless.requestToken(function(user, delivery, callback) {
        for (var i = admins.length - 1; i >= 0; i--) {
            if (admins[i].email === user.toLowerCase()) {
                return callback(null, admins[i].id);
            }
        }
        callback(null, null);
    }),
    function(req, res) {
        // success!
        res.render("email-sent");
    }
);
module.exports = router;
