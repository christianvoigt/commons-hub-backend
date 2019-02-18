var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var Schema = mongoose.Schema;

var COwnerSchema = new Schema({
  name: String,
  url: { type: String, required: true, validate: urlValidator },
  project: { type: Schema.Types.ObjectId, ref: "CProject", required: true },
  uid: { type: String, required: true }
});
module.exports = mongoose.model("COwner", COwnerSchema);
