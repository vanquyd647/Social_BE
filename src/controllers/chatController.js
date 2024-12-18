const ChatRoom = require('../models/Chat');

// Tạo phòng chat mới
const createChatRoom = async (req, res) => {
    try {
        const { members, name } = req.body;

        // Thêm người dùng hiện tại nếu chưa có
        if (!members.includes(req.userId)) {
            members.push(req.userId);
        }

        // Loại bỏ thành viên trùng lặp
        const uniqueMembers = [...new Set(members)];

        // Phân biệt phòng chat nhóm và phòng riêng
        const type = uniqueMembers.length > 2 ? 'group' : 'private';

        // Nếu là phòng riêng, kiểm tra phòng đã tồn tại hay chưa
        if (type === 'private') {
            const existingChatRoom = await ChatRoom.findOne({
                members: { $all: uniqueMembers, $size: uniqueMembers.length },
                type: 'private',
            }).populate('members', 'username avatar_url').exec();

            if (existingChatRoom) {
                // Định dạng thông tin phòng chat
                const formattedChatRoom = formatChatRoom(existingChatRoom, req.userId);

                return res.status(200).json({
                    message: 'Private chat room already exists',
                    chatRoom: formattedChatRoom,
                });
            }
        }

        // Tạo phòng chat mới
        const newChatRoom = new ChatRoom({
            name: type === 'group' ? name : null, // Đặt tên nếu là nhóm
            type,
            members: uniqueMembers,
        });

        await newChatRoom.save();

        // Populate thông tin thành viên trước khi định dạng
        const populatedChatRoom = await ChatRoom.findById(newChatRoom._id)
            .populate('members', 'username avatar_url')
            .exec();

        // Định dạng thông tin phòng chat
        const formattedChatRoom = formatChatRoom(populatedChatRoom, req.userId);

        res.status(201).json({
            message: 'Chat room created successfully',
            chatRoom: formattedChatRoom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Hàm định dạng phòng chat
const formatChatRoom = (chatRoom, userId) => {
    if (chatRoom.type === 'private') {
        const friend = chatRoom.members.find(
            member => member._id.toString() !== userId
        );

        return {
            _id: chatRoom._id,
            type: 'private',
            displayName: friend ? friend.username : 'Unknown User',
            avatar: friend ? friend.avatar_url : null,
        };
    } else {
        return {
            _id: chatRoom._id,
            type: 'group',
            displayName: chatRoom.name || 'Group Chat',
        };
    }
};



// Lấy danh sách phòng chat của người dùng
const getUserChats = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(400).json({ message: 'User not authenticated.' });
        }

        // Tìm tất cả phòng chat mà người dùng hiện tại tham gia
        const chatRooms = await ChatRoom.find({ members: req.userId })
            .populate('members', 'username avatar_url') // Populate username và avatar_url
            .exec();

        if (!chatRooms.length) {
            return res.status(200).json({
                message: 'No chat rooms found',
                chatRooms: [],
            });
        }

        // Định dạng danh sách phòng chat
        const formattedChatRooms = chatRooms.map(chatRoom => {
            if (chatRoom.type === 'private') {
                // Loại người dùng hiện tại khỏi danh sách thành viên
                const friend = chatRoom.members.find(
                    member => member._id.toString() !== req.userId
                );

                return {
                    _id: chatRoom._id,
                    type: 'private',
                    displayName: friend ? friend.username : 'Unknown User', // Tên bạn bè hoặc mặc định
                    avatar: friend ? friend.avatar_url : null, // Avatar bạn bè nếu có
                    recipient_id: friend ? friend._id.toString() : null, // recipient_id là ID của người còn lại
                };
            } else {
                // Hiển thị thông tin phòng nhóm
                return {
                    _id: chatRoom._id,
                    type: 'group',
                    displayName: chatRoom.name || 'Group Chat', // Tên nhóm hoặc mặc định
                    recipient_id: null, // Phòng nhóm không có recipient_id
                };
            }
        });

        // Trả về kết quả
        res.status(200).json({
            message: 'Chat rooms fetched successfully',
            chatRooms: formattedChatRooms,
            userId: req.userId,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching chat rooms.' });
    }

};



module.exports = {
    createChatRoom,
    getUserChats,
};
