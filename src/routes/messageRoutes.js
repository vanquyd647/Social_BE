// src/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');


// Gửi tin nhắn
router.post('/:room_id/send', messageController.sendMessage);

// Lấy tin nhắn trong phòng chat
router.get('/:room_id/messages', messageController.getMessagesInRoom);

module.exports = router;
