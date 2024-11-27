const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema(
    {
        user1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người gửi yêu cầu
        user2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người nhận yêu cầu
        status: { type: String, enum: ['pending', 'accepted', 'declined', 'blocked'], required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Friendship', friendshipSchema);

