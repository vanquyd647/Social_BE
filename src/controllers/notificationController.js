const Notification = require('../models/Notification');

// Lấy danh sách thông báo của người dùng
const getNotifications = async (req, res) => {
    try {
        const { user_id } = req.params; // ID của người dùng để lấy thông báo

        // Lấy thông báo của người dùng từ database, có thể paginate nếu cần
        const notifications = await Notification.find({ user_id })
            .sort({ createdAt: -1 }) // Sắp xếp thông báo mới nhất ở đầu
            .exec();

        res.status(200).json({
            message: 'Notifications fetched successfully',
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Đánh dấu thông báo là đã đọc
const markNotificationAsRead = async (req, res) => {
    try {
        const { notification_id } = req.params; // ID của thông báo cần đánh dấu là đã đọc

        // Cập nhật trạng thái thông báo thành đã đọc
        const notification = await Notification.findByIdAndUpdate(
            notification_id,
            { is_read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            message: 'Notification marked as read',
            notification,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
};
