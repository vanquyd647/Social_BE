const Message = require('../models/Message');

// Gửi tin nhắn trong phòng chat
const sendMessage = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { sender_id, content } = req.body;

        const newMessage = new Message({
            room_id,
            sender_id,
            content,
        });

        await newMessage.save();

        res.status(201).json({
            message: 'Message sent successfully',
            message: newMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Lấy lịch sử tin nhắn của phòng chat
const getMessagesInRoom = async (req, res) => {
    try {
        const { room_id } = req.params;
        const messages = await Message.find({ room_id }).exec();

        res.status(200).json({
            message: 'Messages fetched successfully',
            messages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessagesInRoom,
};
