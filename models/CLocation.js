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
    originalId: { type: String, required: true },
    source: { type: Schema.Types.ObjectId, ref: "CDataSource", required: true },
    url: { type: String }
});

CLocationSchema.index({ geometry: "2dsphere" });
module.exports = mongoose.model("CLocation", CLocationSchema);
