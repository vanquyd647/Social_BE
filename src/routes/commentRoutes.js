// src/routes/commentRoutes.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Tạo bình luận mới
router.post('/:post_id', commentController.createComment);

// Lấy bình luận của một bài viết
router.get('/:post_id', commentController.getPostComments);

module.exports = router;
