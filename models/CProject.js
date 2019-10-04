var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var Schema = mongoose.Schema;

var CProjectSchema = new Schema({
    url: { type: String, validate: urlValidator },
    originalId: { type: String, required: true },
    source: { type: Schema.Types.ObjectId, ref: "CDataSource", required: true },
    name: { type: String, required: true },
    description: { type: String }
});

module.exports = mongoose.model("CProject", CProjectSchema);
