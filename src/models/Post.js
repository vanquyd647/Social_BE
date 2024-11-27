const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String },
        media_urls: [{ type: String }],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
