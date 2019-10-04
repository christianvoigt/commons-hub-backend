var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var Schema = mongoose.Schema;

var COwnerSchema = new Schema({
    name: String,
    url: { type: String, required: true, validate: urlValidator },
    originalId: { type: String, required: true },
    source: { type: Schema.Types.ObjectId, ref: "CDataSource", required: true }
});
module.exports = mongoose.model("COwner", COwnerSchema);
