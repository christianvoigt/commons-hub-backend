var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var Schema = mongoose.Schema;

var CProjectSchema = new Schema({
  endpoint: { type: String, required: true, validate: urlValidator },
  url: { type: String, validate: urlValidator },
  name: { type: String, required: true },
  imported: { type: Date, default: Date.now },
  description: { type: String },
  is_blocked: { type: Boolean, default: false }
});

module.exports = mongoose.model("CProject", CProjectSchema);
