const admin = require("firebase-admin");

try {
    const serviceAccount = require('./serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    console.log("[Firebase] Successfully initialized in config.");
    module.exports = admin;
} catch (error) {
    console.warn('[Firebase] Push unavailable; database notifications remain enabled. Check serviceAccountKey.json.');
    module.exports = null;
}
