const asyncMiddleware = require("../utils/asyncMiddleware");
const CDataSource = require("../models/CDataSource");
const CItem = require("../models/CItem");
const CSlot = require("../models/CSlot");
const CLocation = require("../models/CLocation");
const CProject = require("../models/CProject");
//const logger = require('../utils/logger');

exports.admin = asyncMiddleware(async (req, res) => {
    res.render("admin", { user: req.user });
});
exports.source = asyncMiddleware(async (req, res) => {
    const sourceId = req.params.sourceId;
    const source = await CDataSource.findOne({ _id: sourceId }).exec();
    const items = await CItem.find({ source: sourceId }).exec();
    res.render("source", {
        user: req.user,
        source,
        items
    });
});
exports.item = asyncMiddleware(async (req, res) => {
    const itemId = req.params.itemId;
    const item = await CItem.findOne({ _id: itemId }).exec();
    const slots = await CSlot.find({ item: itemId }).exec();
    res.render("item", {
        user: req.user,
        item,
        slots
    });
});
exports.project = asyncMiddleware(async (req, res) => {
    const projectId = req.params.projectId;
    const project = await CProject.findOne({ _id: projectId }).exec();
    res.render("project", {
        user: req.user,
        project
    });
});
exports.location = asyncMiddleware(async (req, res) => {
    const locationId = req.params.locationId;
    const location = await CLocation.findOne({ _id: locationId }).exec();
    res.render("location", {
        user: req.user,
        location
    });
});
exports.blacklist_get = asyncMiddleware(async (req, res) => {
    const sources = await CDataSource.find().exec();
    res.render("sources", { user: req.user, sources });
});
exports.blacklist_post = asyncMiddleware(async (req, res) => {
    const sources = await CDataSource.find().exec();
    const blocked = [];
    const notBlocked = [];
    for (var source of sources) {
        const isBlocked = req.body[`isBlocked-${source._id}`];
        if (isBlocked) {
            source.isBlocked = true;
            blocked.push(source._id);
        } else {
            source.isBlocked = false;
            notBlocked.push(source._id);
        }
    }
    const promises = [];
    promises[0] = CDataSource.updateMany(
        { _id: { $in: blocked } },
        { isBlocked: true }
    );
    promises[1] = CDataSource.updateMany(
        { _id: { $in: notBlocked } },
        { isBlocked: false }
    );
    await Promise.all(promises);
    res.render("sources", { user: req.user, sources });
});
