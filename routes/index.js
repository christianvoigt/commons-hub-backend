var express = require("express");
var router = express.Router();
var passwordless = require("passwordless");
// Require controller modules.
const import_controller = require("../controllers/ImportController");
const admin_controller = require("../controllers/AdminController");
// var instance_controller = require('../controllers/CProjectController');
// var category_controller = require('../controllers/CBCategoryController');
// var owner_controller = require('../controllers/CBOwnerController');
// GET index home page.
router.get("/", function(req, res) {
  res.render("index", { user: req.user });
});

router.get("/notify/", import_controller.notify);

/* GET restricted site. */
router.get("/admin", passwordless.restricted(), admin_controller.admin);

router.get(
  "/admin/project",
  // passwordless.restricted(),
  admin_controller.blacklist_get
);
router.get(
  "/admin/item/:itemId",
  // passwordless.restricted(),
  admin_controller.item
);
router.get(
  "/admin/project/:projectId",
  // passwordless.restricted(),
  admin_controller.project
);

router.post(
  "/admin/project",
  passwordless.restricted(),
  admin_controller.blacklist_post
);

/* GET login screen. */
router.get("/login", function(req, res) {
  res.render("login", { user: req.user });
});

/* GET logout. */
router.get("/logout", function(req, res) {
  res.redirect("/");
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
