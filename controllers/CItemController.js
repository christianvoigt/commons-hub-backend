const asyncMiddleware = require("../utils/asyncMiddleware");
const CItem = require("../models/CItem");
//const logger = require('../utils/logger');

exports.index = asyncMiddleware(async (req, res) => {
  const items = await CItem.find().exec();
  res.json(items);
});
