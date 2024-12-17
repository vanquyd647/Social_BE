const notificationHistory = [];

const addNotificationToHistory = (token, title, body) => {
    notificationHistory.push({
        token,
        title,
        body,
        timestamp: new Date(),
    });
};

const getNotificationHistory = () => {
    return notificationHistory;
};

module.exports = { addNotificationToHistory, getNotificationHistory };
