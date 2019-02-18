const asyncMiddleware = require("../utils/asyncMiddleware");
const CLocation = require("../models/CLocation");
//const logger = require('../utils/logger');

exports.index = asyncMiddleware(async (req, res) => {
  const locations = await CLocation.find({}).exec();
  res.json(locations);
});
