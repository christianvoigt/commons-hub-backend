var express = require("express");
var router = express.Router();

// Require controller modules.
const query_controller = require("../controllers/QueryController");

router.get("/", query_controller.index);
module.exports = router;
