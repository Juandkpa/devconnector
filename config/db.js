const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};

const connectDB = async () => {
    try {
        await mongoose.connect(db, options);
    } catch(err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;