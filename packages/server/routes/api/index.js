const authRouter = require('./auth');
const postsRouter = require('./posts');
const profileRouter = require('./profile');
const usersRouter = require('./users');
const uploadRouter = require('./upload');

module.exports = {
    authRouter,
    postsRouter,
    profileRouter,
    usersRouter,
    uploadRouter
};