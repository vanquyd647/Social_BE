const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middlewares/authMiddleware');  // Import middleware xác thực

// Tạo bài viết
router.post('/', authenticateToken, postController.createPost);  // Thêm middleware xác thực token

// Lấy tất cả bài viết
router.get('/', postController.getPosts);  // Thêm middleware xác thực token

// Thích bài viết
router.post('/:post_id/like', authenticateToken, postController.likePost);  // Thêm middleware xác thực token

// Bình luận bài viết
router.post('/:post_id/comment', authenticateToken, postController.addComment);  // Thêm middleware xác thực token

module.exports = router;
