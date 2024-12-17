const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
        avatar_url: { type: String },
        bio: { type: String },
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        friend_requests: [
            {
                sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID người gửi yêu cầu
                status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }, // Trạng thái
                createdAt: { type: Date, default: Date.now }, // Thời gian gửi yêu cầu
            },
        ],
        firebaseToken: { type: String },
        refresh_token: { type: String },
        otp: { type: String },
        otp_expires: { type: Date },
        password_reset_otp: { type: String, default: null },
        password_reset_otp_expires: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
