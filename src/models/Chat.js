const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true }, 
        type: { type: String, enum: ['group', 'private'], default: 'private' }, 
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
