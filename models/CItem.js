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
    originalId: { type: String, required: true },
    source: { type: Schema.Types.ObjectId, ref: "CDataSource", required: true },
    url: { type: String, required: true, validate: urlValidator },
    itemType: { type: String },
    features: [{ type: String }],
    isCommercial: { type: Boolean },
    boxDimensions: {
        width: { type: Number },
        height: { type: Number },
        length: { type: Number }
    },
    loadCapacity: { type: Number }
});
module.exports = mongoose.model("CItem", CItemSchema);
