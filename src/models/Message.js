// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',  // assuming you have a "Room" model, you can change this if needed
            required: true,
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // assuming you have a "User" model
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }  // Automatically create createdAt and updatedAt fields
);

module.exports = mongoose.model('Message', messageSchema);
