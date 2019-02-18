var express = require("express");
var router = express.Router();

// Require controller modules.
const location_controller = require("../controllers/CLocationController");

router.get("/", location_controller.index);
module.exports = router;
