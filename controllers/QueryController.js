// const asyncMiddleware = require("../utils/asyncMiddleware");
// const CLocation = require("../models/CLocation");
// //const logger = require('../utils/logger');
// exports.index = asyncMiddleware(async (req, res) => {
//     const locations = await CLocation.find({}).exec();
//     res.json(locations);
// });
const asyncMiddleware = require("../utils/asyncMiddleware");
const CLocation = require("../models/CLocation");
const CSlot = require("../models/CSlot");
const CItem = require("../models/CItem");
const moment = require("moment");

//const logger = require('../utils/logger');
const { check, validationResult } = require("express-validator/check");

exports.index = [
    check("lat").isNumeric(),
    check("long").isNumeric(),
    asyncMiddleware(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        var long = req.query.long;
        var lat = req.query.lat;

        const locations = await CLocation.find({
            geometry: {
                $near: {
                    $maxDistance: 100000,
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    }
                }
            }
        }).exec();

        // const locations = await CLocation.find({});
        const locationIds = locations.map(l => l._id);
        let start = moment(req.query.start);
        if (!start.isValid()) {
            start = moment().startOf("day");
        } else {
            start = start.startOf("day");
        }
        let end = moment(req.query.end);

        if (!end.isValid()) {
            end = moment().endOf("day"); // set to 23:59 pm today
        } else {
            end = end.endOf("day");
        }
        // start = moment().startOf("day");
        // end = moment().endOf("day"); // set to 23:59 pm today
        const slotQuery = {
            start: { $gte: start.toISOString(), $lte: end.toISOString() },
            // end: { $lte: end.toISOString() },
            location: { $in: locationIds }
        };
        const availability = await CSlot.find(slotQuery).exec();
        const itemIds = availability.reduce((acc, curr) => {
            acc[curr.item] = true;
            return acc;
        }, {});
        const items = await CItem.find({
            _id: { $in: Object.keys(itemIds) }
        })
            .populate("project", "name url")
            .exec();
        res.json({ locations, availability, items });
    })
];
