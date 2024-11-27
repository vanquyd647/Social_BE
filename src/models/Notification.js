const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['like', 'comment', 'follow', 'friend_request'], required: true },
        content: { type: String, required: true },
        is_read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
