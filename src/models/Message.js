const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
        sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
