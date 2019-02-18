var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var CSlot = require("./CSlot");

//Define a schema
var Schema = mongoose.Schema;

var CItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  project: { type: Schema.Types.ObjectId, ref: "CProject", required: true },
  owner: { type: Schema.Types.ObjectId, ref: "COwner", required: true },
  uid: { type: String, required: true },
  url: { type: String, required: true, validate: urlValidator },
  canTransportChildren: { type: Boolean },
  maxTransportWeight: { type: Number },
  nrOfWheels: { type: Number }
});
module.exports = mongoose.model("CItem", CItemSchema);
