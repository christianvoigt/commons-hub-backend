const asyncMiddleware = require("../utils/asyncMiddleware");
const CProject = require("../models/CProject");
const CItem = require("../models/CItem");
const CSlot = require("../models/CSlot");
//const logger = require('../utils/logger');

exports.admin = asyncMiddleware(async (req, res) => {
  res.render("admin", { user: req.user });
});
exports.project = asyncMiddleware(async (req, res) => {
  const projectId = req.params.projectId;
  const project = await CProject.findOne({ _id: projectId }).exec();
  const items = await CItem.find({ project: projectId }).exec();
  res.render("project", {
    user: req.user,
    project,
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
exports.blacklist_get = asyncMiddleware(async (req, res) => {
  const projects = await CProject.find().exec();
  res.render("projects", { user: req.user, projects: projects });
});
exports.blacklist_post = asyncMiddleware(async (req, res) => {
  const projects = await CProject.find().exec();
  const blocked = [];
  const notBlocked = [];
  for (var project of projects) {
    const is_blocked = req.body[`is_blocked-${project._id}`];
    if (is_blocked) {
      project.is_blocked = true;
      blocked.push(project._id);
    } else {
      project.is_blocked = false;
      notBlocked.push(project._id);
    }
  }
  const promises = [];
  promises[0] = CProject.updateMany(
    { _id: { $in: blocked } },
    { is_blocked: true }
  );
  promises[1] = CProject.updateMany(
    { _id: { $in: notBlocked } },
    { is_blocked: false }
  );
  await Promise.all(promises);
  res.render("projects", { user: req.user, projects: projects });
});
