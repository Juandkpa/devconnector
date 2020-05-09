const express = require('express');
const {authRouter, postsRouter, profileRouter, usersRouter} = require('./routes/api');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json({ extended: false }));


app.use('/api/auth', authRouter);
app.use('/api/post', postsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/users', usersRouter);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log('Server up and running on port ' + PORT)
})