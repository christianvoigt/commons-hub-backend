var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var Schema = mongoose.Schema;

var CProjectSchema = new Schema({
  url: { type: String, required: true, validate: urlValidator },
  uid: { type: String, required: true },
  name: { type: String, required: true },
  imported: { type: Date, default: Date.now },
  description: { type: String },
  is_blocked: { type: Boolean, default: false }
});

module.exports = mongoose.model("CProject", CProjectSchema);
