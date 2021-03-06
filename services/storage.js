const admin = require('firebase-admin');
const uuid = require('uuid');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "gs://devconec.appspot.com"
});

var bucket = admin.storage().bucket();

const generateSignedUrl = async (userId, type) => {
    const key = `${userId}/${uuid.v1()}.${type}`;
    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 5*60 * 1000,
        contentType: `image/${type}`
    };

    const [ url ] = await bucket
        .file(key)
        .getSignedUrl(options);

    return [url, key.replace('/', '%2F')];
};

module.exports = generateSignedUrl;