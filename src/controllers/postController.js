const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');  // Import model User
const mongoose = require('mongoose');

// Tạo bài viết
const createPost = async (req, res) => {
    const { content, media_urls } = req.body;

    try {
        // Kiểm tra req.userId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Tìm user dựa vào ID
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo bài viết mới
        const newPost = new Post({ author_id: user._id, content, media_urls });
        await newPost.save();

        // Trả về bài viết mới tạo
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error); // Log lỗi để debug
        res.status(500).json({ message: error.message });
    }
};

// Lấy tất cả bài viết
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({
                path: 'author_id',
                select: 'username avatar_url' // Lấy cả username và avatar_url từ User
            })
            .populate('likes') // Populate likes
            .populate({
                path: 'comments', // Populate comments
                populate: {
                    path: 'author_id', // Lấy thông tin user trong comment
                    select: 'username avatar_url' // Lấy cả username và avatar_url từ User
                }
            });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Thích bài viết
const likePost = async (req, res) => {
    const postId = req.params.post_id;
    const userId = req.userId;  // Lấy userId từ token đã được xác thực

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bình luận bài viết
const addComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.post_id;
    const author_id = req.userId;  // Lấy userId từ token đã được xác thực

    try {
        const newComment = new Comment({ post_id: postId, content, author_id });
        await newComment.save();

        const post = await Post.findById(postId);
        post.comments.push(newComment._id);
        await post.save();

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getPosts, likePost, addComment };
