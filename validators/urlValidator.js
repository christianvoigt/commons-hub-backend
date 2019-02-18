var validate = require('mongoose-validator');

module.exports = [
    validate({
        validator: 'isURL',
        arguments: { protocols: ['http', 'https'] },
        message: 'Value is not a valid url.'
    })
];