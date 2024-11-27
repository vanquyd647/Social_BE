const ChatRoom = require('../models/Chat');

// Tạo phòng chat mới
const createChatRoom = async (req, res) => {
    try {
        const { members } = req.body;
        const newChatRoom = new ChatRoom({ members });
        await newChatRoom.save();

        res.status(201).json({
            message: 'Chat room created successfully',
            chatRoom: newChatRoom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Lấy danh sách phòng chat của người dùng
const getUserChats = async (req, res) => {
    try {
        const { user_id } = req.params;
        const chatRooms = await ChatRoom.find({ members: user_id }).exec();

        res.status(200).json({
            message: 'Chat rooms fetched successfully',
            chatRooms,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createChatRoom,
    getUserChats,
};
