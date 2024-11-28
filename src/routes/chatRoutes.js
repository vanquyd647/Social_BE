// src/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middlewares/authMiddleware');


// Tạo phòng chat mới
router.post('/create', authenticateToken, chatController.createChatRoom);

// Lấy danh sách phòng chat của người dùng
router.get('/chatrooms', authenticateToken,  chatController.getUserChats);

module.exports = router;
