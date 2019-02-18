var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});
var CLocationSchema = new mongoose.Schema({
  geometry: {
    type: PointSchema,
    required: true
  },
  name: String,
  description: String,
  address: String,
  project: { type: Schema.Types.ObjectId, ref: "CProject", required: true },
  uid: { type: String, required: true },
  url: { type: String }
});
module.exports = mongoose.model("CLocation", CLocationSchema);
