require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const Message = require('./src/models/Message');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const admin = require('./src/configs/firebaseAdmin');
const ChatRoom = require('./src/models/Chat'); // Đảm bảo model ChatRoom đã được import

// Create HTTP server with Express
const server = http.createServer(app);

// Integrate Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // For local dev, update for production with specific origins
        methods: ["GET", "POST"]
    }
});

// Connection event
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join chat room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
        const { room_id, sender_id, content } = data;

        console.log('Received data:', data);  // Debugging log

        try {
            if (!room_id || !mongoose.Types.ObjectId.isValid(room_id)) {
                socket.emit('errorMessage', 'Invalid room ID.');
                return;
            }

            if (!content || content.trim() === '') {
                socket.emit('errorMessage', 'Message content cannot be empty.');
                return;
            }

            // Save message to the database
            const newMessage = new Message({ room_id, sender_id, content });
            await newMessage.save();

            // Emit message to all users in the room
            io.to(room_id).emit('receiveMessage', {
                room_id,
                sender_id,
                content,
                timestamp: new Date(),
            });

            // Fetch room members to send FCM notifications
            const room = await ChatRoom.findById(room_id).populate({
                path: 'members',
                select: 'firebaseToken', // Populate only the firebaseToken field
            });

            if (!room) {
                console.error('Room not found.');
                return;
            }

            // Send FCM to all other members in the room (excluding sender)
            for (const member of room.members) {
                if (member._id.toString() !== sender_id && member.firebaseToken) {
                    const fcmMessage = {
                        notification: {
                            title: 'New Message',
                            body: content,
                        },
                        token: member.firebaseToken,
                    };

                    // Send FCM using Firebase Admin SDK
                    await admin.messaging().send(fcmMessage)
                        .then((response) => {
                            console.log(`FCM sent to ${member._id}:`, response);
                        })
                        .catch((error) => {
                            console.error(`Error sending FCM to ${member._id}:`, error.message);
                        });
                }
            }

        } catch (error) {
            console.error('Error processing sendMessage:', error.message);
            socket.emit('errorMessage', 'There was an error processing your message.');
        }
    });

    // Disconnection event
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
