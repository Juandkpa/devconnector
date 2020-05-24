const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please inculde a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min:6})
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( {errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ erros: [{ msg: 'User already exists'} ]});

        const salt = await bcrypt.genSalt(10);

        user = new User({name, email, password});
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: { id: user.id }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 36000 },
            (error, token) => {
                if (error) throw error;
                res.json({ token });
            }
        );

    }catch(error) {
        console.error(error);
        res.status(500).send('Server Error');
    }

});

module.exports = router;