const router = require('express').Router();
const auth = require('../../middleware/auth');
const generateSignedUrl = require('../../services/storage');

router.get('/:type', auth, async (req, res) => {
    try {
        const [url, key] = await generateSignedUrl(req.user.id, req.params.type);
        res.status(200).send({ url, key:`${key}?alt=media` });

    } catch(error) {
        console.log(error);
        res.status(500).send();
    }
});

module.exports = router;