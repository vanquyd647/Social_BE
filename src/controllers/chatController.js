const ChatRoom = require('../models/Chat');

// Tạo phòng chat mới
const createChatRoom = async (req, res) => {
    try {
        const { members } = req.body;

        // Thêm người dùng hiện tại (đã xác thực) vào danh sách thành viên nếu chưa có
        if (!members.includes(req.userId)) {
            members.push(req.userId);
        }

        // Loại bỏ các thành viên trùng lặp
        const uniqueMembers = [...new Set(members)];

        // Nếu cần đảm bảo không tạo trùng phòng (ví dụ: phòng giữa hai người)
        const existingChatRoom = await ChatRoom.findOne({
            members: { $all: uniqueMembers, $size: uniqueMembers.length },
        }).exec();

        if (existingChatRoom) {
            return res.status(200).json({
                message: 'Chat room already exists',
                chatRoom: existingChatRoom,
            });
        }

        // Tạo phòng chat mới
        const newChatRoom = new ChatRoom({ members: uniqueMembers });
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
        // Kiểm tra xem req.userId có tồn tại hay không (đảm bảo rằng người dùng đã đăng nhập)
        if (!req.userId) {
            return res.status(400).json({ message: 'User not authenticated.' });
        }

        // Tìm tất cả phòng chat mà người dùng hiện tại tham gia
        const chatRooms = await ChatRoom.find({ members: req.userId }).exec();

        if (!chatRooms.length) {
            return res.status(200).json({
                message: 'No chat rooms found',
                chatRooms: [],
                userId: req.userId, // Trả về userId trong response
            });
        }

        res.status(200).json({
            message: 'Chat rooms fetched successfully',
            chatRooms,
            userId: req.userId, // Trả về userId trong response
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
