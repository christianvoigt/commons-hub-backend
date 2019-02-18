const asyncMiddleware = require("../utils/asyncMiddleware");
const CSlot = require("../models/CSlot");
//const logger = require('../utils/logger');
const moment = require("moment");

exports.index = asyncMiddleware(async (req, res) => {
  // let start = moment(req.query.start);
  // if (!start.isValid()) {
  //   start = moment().startOf("day");
  // }
  // let end = moment(req.query.end);

  // if (!end.isValid()) {
  //   end = moment().endOf("day"); // set to 23:59 pm today
  // }
  // const query = {
  //   start: { $gte: start.toISOString() },
  //   end: { $lte: end.toISOString() }
  // };
  const query = {};
  const slots = await CSlot.find(query).exec();
  res.json(slots);
});
