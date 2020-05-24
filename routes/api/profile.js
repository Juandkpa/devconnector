const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const cleanCache = require('../../middleware/cleanCache');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const User = require('../../models/User');


router.get('/me', auth, async(req, res) => {
    try {
        const profile = await Profile
                        .findOne({user: req.user.id})
                        .populate({path:'user', select:['name', 'avatar'], model: User})
                        .cache({key: req.user.id});

        if (!profile) return res.status(400).json({ msg: 'There is no profile for this user'});

        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', [auth, cleanCache, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
    ]
],
async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({error: errors.array()});
    }

    const {
        avatar,
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    const profileFields = {
        user: req.user.id,
        avatar: avatar ? avatar : undefined,
        company: company ? company : undefined,
        website: website ? website : undefined,
        location: location ? location : undefined,
        bio: bio ? bio : undefined,
        status: status ? status : undefined,
        githubusername: githubusername ? githubusername : undefined, //TODO: fix this :S
        skills: skills ? (!Array.isArray(skills) ? skills.split(',').map(skill => skill.trim()) : skills.map(skill => skill.trim())) : undefined,
        social: {
            youtube: youtube ? youtube : undefined,
            facebook : facebook ? facebook : undefined,
            twitter : twitter ? twitter : undefined,
            instagram: instagram ? instagram : undefined,
            linkedin: linkedin ? linkedin : undefined
        }
    };

    try {
        let profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                profileFields,
                {new: true}
            );

        if (!profile) {
            profile = new Profile(profileFields)
            await profile.save();
        }

        return res.json(profile);

    }catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate({path:'user', select: ['name', 'avatar'], model: User}).cache();
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate({path:'user', select:['name', 'avatar'], model: User})
        .cache({key: req.params.user_id});

        if (!profile) return res.status(400).json({ msg: 'Profile not found'});

        res.json(profile);
    } catch (error) {
        console.log("error", error);
        res.status(500).send('Server Error');
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        await Post.deleteMany({ user: req.user.id});
        await Profile.findOneAndRemove({user: req.user.id}).populate('user', ['name', 'avatar']);
        await User.findOneAndRemove({_id: req.user.id});

        res.json({ msg: 'User deleted'});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});
//TODO: check if can made custom middleware with checks
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if(!profile) return res.status(404).json({msg: 'Profile not found'});

        profile.experience.unshift(req.body);
        await profile.save();
        res.json(profile);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

router.delete('/experience/:exp_id', auth, async(req, res) =>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);

    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if(!profile) return res.status(404).json({msg: 'Profile not found'});

        profile.education.unshift(req.body);
        await profile.save();
        res.json(profile);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

router.delete('/education/:exp_id', auth, async(req, res) =>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);

        profile.education.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);

    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/github/:username', async(req, res) => {
    try {
        const url = `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClienId')}&client_secret=${config.get('githubClientSecret')}`;
        const response = await axios.get(url);

        res.send(response.data);

    } catch (error) {
        if(error.response) {
            const {status, statusText} = error.response;
            return res.status(status).json({msg: `Profile ${statusText}`});
        }

        res.status(500).send('Server Error');
    }
})

module.exports = router;