// src/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');


// Tạo phòng chat mới
router.post('/create', chatController.createChatRoom);

// Lấy danh sách phòng chat của người dùng
router.get('/:user_id', chatController.getUserChats);

module.exports = router;
