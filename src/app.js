// src/app.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const app = express();
const corsOptions = {
    origin: '*',  // Cấp quyền cho tất cả các domain (nên thay bằng domain của bạn khi deploy)
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
};

// Init middleware
app.use(morgan('dev')); // Log requests
app.use(helmet()); // Add security headers
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON request bodies
app.use(cors(corsOptions));
// Init DB connection
require('./dbs/init.mongodb_Api');

// Import routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const friendshipRoutes = require('./routes/friendshipRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Export the app for server to use
module.exports = app;
