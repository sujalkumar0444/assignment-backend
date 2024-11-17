const crypto = require('crypto-js');
const admin = require("firebase-admin");
// const dotenv = require('dotenv');
// dotenv.config();

const encryptedContent = process.env.SECRET_TEXT;
const bytes = crypto.AES.decrypt(encryptedContent, process.env.FIREBASE_SECRET_KEY);
const decrypted = bytes.toString(crypto.enc.Utf8);

let serviceAccountJson;
try {
    serviceAccountJson = JSON.parse(decrypted);
} catch (error) {
    console.error('Error parsing JSON:', error);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson),
    storageBucket: process.env.STORAGE_BUCKET
});

module.exports = admin;
