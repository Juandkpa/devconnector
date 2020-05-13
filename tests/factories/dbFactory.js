const mongoose = require('mongoose');
const User = require('../../models/User');

const getUser = async () => {
    await User.deleteMany();
    return  new User({
        name: 'test',
        email: 'test@test.com',
        password: '%%12353&&'
    }).save();
};

const disconnectDb = async () => {
    await mongoose.connection.close();
};

module.exports = {
    disconnectDb,
    getUser
};
