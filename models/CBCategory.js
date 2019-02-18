var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var CBCategorySchema = new Schema({
    name: {type: String, min: 3, max: 100, required: true}
});

CBCategorySchema
    .virtual('url')
    .get(function () {
        return '/category/' + this._id;
    });

//Export function to create "SomeModel" model class
module.exports = mongoose.model('CBCategory', CBCategorySchema);