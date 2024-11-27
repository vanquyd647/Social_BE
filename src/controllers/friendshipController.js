const Friendship = require('../models/Friendship');
const User = require('../models/User');

// Tìm kiếm người dùng để gửi lời mời kết bạn
const searchUsers = async (req, res) => {
    const userId = req.userId; // Lấy userId từ token
    const { query } = req.query; // Từ khóa tìm kiếm (tên, email, v.v.)

    try {
        // Tìm tất cả người dùng có liên quan đến từ khóa
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } }, // Tìm theo tên
                { email: { $regex: query, $options: 'i' } } // Tìm theo email
            ],
            _id: { $ne: userId } // Loại trừ chính người dùng hiện tại
        });

        // Lọc ra người dùng đã là bạn bè hoặc đã gửi lời mời
        const friendships = await Friendship.find({
            $or: [
                { user1_id: userId },
                { user2_id: userId },
            ]
        }).lean();

        const excludedIds = new Set(
            friendships.flatMap(friendship => [
                friendship.user1_id,
                friendship.user2_id,
            ])
        );

        const filteredUsers = users.filter(user => !excludedIds.has(user._id.toString()));

        res.json({ users: filteredUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Gửi yêu cầu kết bạn
const sendFriendRequest = async (req, res) => {
    const user1_id = req.userId; // Người gửi yêu cầu
    const { user2_id } = req.body; // Người nhận yêu cầu

    try {
        if (user1_id === user2_id) {
            return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
        }

        // Kiểm tra nếu đã tồn tại lời mời hoặc mối quan hệ
        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1_id, user2_id },
                { user1_id: user2_id, user2_id: user1_id },
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ message: 'Friendship already exists or pending.' });
        }

        // Tạo lời mời kết bạn mới
        const newRequest = new Friendship({ user1_id, user2_id, status: 'pending' });
        await newRequest.save();

        // Phản hồi với thông tin người gửi và người nhận
        res.status(201).json({
            message: 'Friend request sent successfully.',
            request: {
                sender: await User.findById(user1_id).select('username email'),
                receiver: await User.findById(user2_id).select('username email'),
                requestId: newRequest._id,
                status: newRequest.status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Chấp nhận yêu cầu kết bạn
const acceptFriendRequest = async (req, res) => {
    const user2_id = req.userId; // Người chấp nhận yêu cầu
    const { user1_id } = req.body; // Người gửi yêu cầu

    try {
        // Cập nhật trạng thái lời mời kết bạn thành 'accepted'
        const friendship = await Friendship.findOneAndUpdate(
            { user1_id, user2_id, status: 'pending' },
            { status: 'accepted' },
            { new: true }
        );

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found.' });
        }

        // Cập nhật danh sách bạn bè của cả hai người
        await User.findByIdAndUpdate(user1_id, { $addToSet: { friends: user2_id } });
        await User.findByIdAndUpdate(user2_id, { $addToSet: { friends: user1_id } });

        res.json({
            message: 'Friend request accepted successfully.',
            friendship,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Từ chối hoặc hủy mối quan hệ bạn bè
const removeFriend = async (req, res) => {
    const userId = req.userId; // Người thực hiện hành động
    const { targetUserId } = req.body; // Người bị xóa hoặc từ chối

    try {
        const friendship = await Friendship.findOneAndDelete({
            $or: [
                { user1_id: userId, user2_id: targetUserId },
                { user1_id: targetUserId, user2_id: userId },
            ]
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found.' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách bạn bè
const getFriendsList = async (req, res) => {
    const userId = req.userId; // Lấy userId từ token

    try {
        // Tìm tất cả mối quan hệ bạn bè đã được chấp nhận
        const friendships = await Friendship.find({
            $or: [
                { user1_id: userId, status: 'accepted' },
                { user2_id: userId, status: 'accepted' },
            ]
        }).lean();

        // Lấy danh sách ID bạn bè
        const friendIds = friendships.map(friendship =>
            friendship.user1_id.toString() === userId ? friendship.user2_id : friendship.user1_id
        );

        // Lấy thông tin chi tiết của bạn bè
        const friends = await User.find({ _id: { $in: friendIds } })
            .select('username email');


        res.json({ friends });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách người gửi yêu cầu kết bạn (đang chờ xác nhận)
const getSentRequests = async (req, res) => {
    const userId = req.userId; // Người dùng hiện tại

    try {
        // Lọc danh sách yêu cầu kết bạn đã gửi (status: 'pending')
        const sentRequests = await Friendship.find({
            user1_id: userId,
            status: 'pending'
        }).lean();

        // Lấy thông tin chi tiết của người nhận yêu cầu
        const targetUserIds = sentRequests.map(request => request.user2_id);

        const users = await User.find({ _id: { $in: targetUserIds } }).select('username email');

        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách người nhận yêu cầu kết bạn (chưa trả lời)
const getReceivedRequests = async (req, res) => {
    const userId = req.userId; // Người dùng hiện tại

    try {
        // Lọc danh sách yêu cầu kết bạn nhận được (status: 'pending')
        const receivedRequests = await Friendship.find({
            user2_id: userId,
            status: 'pending'
        }).lean();

        // Lấy thông tin chi tiết của người gửi yêu cầu
        const senderUserIds = receivedRequests.map(request => request.user1_id);

        const users = await User.find({ _id: { $in: senderUserIds } }).select('username email');

        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { searchUsers, sendFriendRequest, acceptFriendRequest, removeFriend, getFriendsList, getSentRequests, getReceivedRequests };
