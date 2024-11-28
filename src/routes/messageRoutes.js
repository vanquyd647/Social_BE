// src/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middlewares/authMiddleware');


// Gửi tin nhắn
router.post('/:room_id/send', authenticateToken,  messageController.sendMessage);

// Lấy tin nhắn trong phòng chat
router.get('/:room_id/messages', authenticateToken, messageController.getMessagesInRoom);

module.exports = router;
