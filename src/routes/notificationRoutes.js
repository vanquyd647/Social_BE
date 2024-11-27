// src/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Lấy danh sách thông báo
router.get('/:user_id', notificationController.getNotifications);

// Đánh dấu thông báo đã đọc
router.put('/:notification_id/mark-read', notificationController.markNotificationAsRead);

module.exports = router;
