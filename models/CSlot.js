var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CSlotSchema = new Schema({
    source: { type: Schema.Types.ObjectId, ref: "CDataSource", required: true },
    item: { type: Schema.Types.ObjectId, ref: "CItem", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    location: { type: Schema.Types.ObjectId, ref: "CLocation", required: true }
});
module.exports = mongoose.model("CSlot", CSlotSchema);
