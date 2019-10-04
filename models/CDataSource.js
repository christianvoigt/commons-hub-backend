var mongoose = require("mongoose");
var urlValidator = require("../validators/urlValidator");
var Schema = mongoose.Schema;

var CDataSourceSchema = new Schema({
    url: { type: String, required: true, validate: urlValidator },
    created: { type: Date, default: Date.now },
    lastChanged: { type: Date, default: Date.now },
    failedRequests: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false }
});

module.exports = mongoose.model("CDataSource", CDataSourceSchema);
