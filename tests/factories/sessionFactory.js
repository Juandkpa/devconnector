const jwt = require('jsonwebtoken');
const config = require('config');
const { promisify } = require('util');
jwt.sign = promisify(jwt.sign);

module.exports = (user) => {

    const payload = {
        user: {
            id: user._id.toString()
        }
    };

   return jwt.sign(payload, config.get('jwtSecret'));
};