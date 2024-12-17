const express = require('express');
const { sendNotification, getHistory } = require('../controllers/pushNotificationController');

const router = express.Router();

router.post('/send-notification', sendNotification);
router.get('/notification-history', getHistory);

module.exports = router;
