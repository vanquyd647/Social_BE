const admin = require('firebase-admin');
const serviceAccount = require('../../red89-f8933-firebase-adminsdk-wt9jo-eb80ac9fa5.json'); // Cập nhật đường dẫn

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
