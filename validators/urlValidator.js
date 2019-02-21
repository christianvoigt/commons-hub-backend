var validate = require("mongoose-validator");

module.exports = [
  validate({
    validator: "isURL",
    arguments: { protocols: ["http", "https"], require_tld: false },
    message: "Value is not a valid url."
  })
];
