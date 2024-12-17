const admin = require('../configs/firebaseAdmin'); // Import Firebase Admin
const { addNotificationToHistory, getNotificationHistory } = require('../components/notificationHistory');

const sendNotification = (req, res) => {
    const { token, title, body } = req.body;

    const message = {
        notification: {
            title: title,
            body: body,
        },
        token: token,
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
            addNotificationToHistory(token, title, body);
            res.status(200).send('Notification sent successfully');
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            res.status(500).send('Error sending notification');
        });
};

const getHistory = (req, res) => {
    res.status(200).json(getNotificationHistory());
};

module.exports = { sendNotification, getHistory };
