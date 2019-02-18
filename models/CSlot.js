var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CSlotSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: "CProject", required: true },
  item: { type: Schema.Types.ObjectId, ref: "CItem", required: true },
  start: Date,
  end: Date,
  status: String,
  location: { type: Schema.Types.ObjectId, ref: "CLocation", required: true }
});
module.exports = mongoose.model("CSlot", CSlotSchema);
