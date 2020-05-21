const router = require('express').Router();
const auth = require('../../middleware/auth');
const generateSignedUrl = require('../../services/storage');

router.get('/', auth, async (req, res) => {
    try {
        const [url, key] = await generateSignedUrl(req.user.id);
        res.status(200).send({ url, key });

    } catch(error) {
        console.log(error);
        res.status(500).send();
    }
});

module.exports = router;