const Comment = require('../models/Comment');

// Tạo bình luận mới
const createComment = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { author_id, content } = req.body;

        const newComment = new Comment({
            post_id,
            author_id,
            content,
        });

        await newComment.save();

        res.status(201).json({
            message: 'Comment created successfully',
            comment: newComment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Lấy bình luận của một bài viết
const getPostComments = async (req, res) => {
    try {
        const { post_id } = req.params;
        const comments = await Comment.find({ post_id }).exec();

        res.status(200).json({
            message: 'Comments fetched successfully',
            comments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createComment,
    getPostComments,
};
