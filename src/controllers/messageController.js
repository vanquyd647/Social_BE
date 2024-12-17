// messageController.js
const mongoose = require('mongoose');
const Message = require('../models/Message');

// Gửi tin nhắn trong phòng chat
const sendMessage = async (req, res) => {
    try {
        const { room_id } = req.params;  // Expecting room_id in URL params for REST API
        const { content } = req.body;
        const sender_id = req.userId;  // Lấy `userId` từ token đã xác thực

        // Kiểm tra `room_id` hợp lệ
        if (!mongoose.Types.ObjectId.isValid(room_id)) {
            return res.status(400).json({ message: 'Invalid room ID format.' });
        }

        // Kiểm tra nội dung tin nhắn
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Message content cannot be empty.' });
        }

        // Tạo tin nhắn mới
        const newMessage = new Message({
            room_id,
            sender_id,
            content,
        });

        await newMessage.save();

        // Trả về tin nhắn đã gửi thành công
        res.status(201).json({
            message: 'Message sent successfully',
            data: newMessage,  // Return the saved message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Lấy lịch sử tin nhắn của phòng chat
// const getMessagesInRoom = async (req, res) => {
//     try {
//         const { room_id } = req.params;

//         // Kiểm tra `room_id` hợp lệ
//         if (!mongoose.Types.ObjectId.isValid(room_id)) {
//             return res.status(400).json({ message: 'Invalid room ID format.' });
//         }

//         const messages = await Message.find({ room_id }).sort({ createdAt: 1 }).exec();

//         res.status(200).json({
//             message: 'Messages fetched successfully',
//             messages,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

const getMessagesInRoom = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { limit = 20, cursor } = req.query;

        // Kiểm tra `room_id` hợp lệ
        if (!mongoose.Types.ObjectId.isValid(room_id)) {
            return res.status(400).json({ message: 'Invalid room ID format.' });
        }

        // Tạo điều kiện tìm kiếm
        const query = { room_id };

        if (cursor) {
            // Sử dụng `new` khi tạo ObjectId
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // Truy vấn các tin nhắn
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .exec();

        // Lấy nextCursor
        const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

        res.status(200).json({
            message: 'Messages fetched successfully',
            messages,
            nextCursor,
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
