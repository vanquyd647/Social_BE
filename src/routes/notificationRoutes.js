// src/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middlewares/authMiddleware');


// Lấy danh sách thông báo
router.get('/', authenticateToken, notificationController.getNotifications);

// Đánh dấu thông báo đã đọc
router.put('/:notification_id', authenticateToken, notificationController.markNotificationAsRead);

module.exports = router;
