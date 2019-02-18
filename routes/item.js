var express = require("express");
var router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/CItemController");
// var instance_controller = require('../controllers/CProjectController');
// var category_controller = require('../controllers/CBCategoryController');
// var owner_controller = require('../controllers/CBOwnerController');
// GET index home page.

router.get("/", item_controller.index);
module.exports = router;
