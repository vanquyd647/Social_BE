// src/routes/friendshipRoutes.js

const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const authenticateToken = require('../middlewares/authMiddleware');


//src/routes/friendshipRoutes.js
router.get('/search', authenticateToken, friendshipController.searchUsers);

// Gửi yêu cầu kết bạn
router.post('/send', authenticateToken, friendshipController.sendFriendRequest);

// Chấp nhận yêu cầu kết bạn
router.post('/accept', authenticateToken, friendshipController.acceptFriendRequest);

// Từ chối/xóa bạn bè
router.delete('/remove', authenticateToken, friendshipController.removeFriend);

// Lấy danh sách bạn bè
router.get('/list', authenticateToken, friendshipController.getFriendsList);

// Lấy danh sách yêu cầu kết bạn
router.get('/requests', authenticateToken, friendshipController.getSentRequests);

// Lấy danh sách bạn bè chờ xác nhận
router.get('/pending', authenticateToken, friendshipController.getReceivedRequests);


module.exports = router;
