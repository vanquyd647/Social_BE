// src/controllers/userController.js
const User = require('../models/User');
const pendingUsers = new Map();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const register = async (req, res) => {
    const { username, email, password, avatar_url, bio } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo mã OTP ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút

        // Lưu thông tin tạm thời vào bộ nhớ
        pendingUsers.set(email, {
            username,
            email,
            password_hash: hashedPassword,
            avatar_url,
            bio,
            otp,
            otp_expires: otpExpires,
        });

        // Xóa dữ liệu tạm thời sau khi OTP hết hạn
        setTimeout(() => pendingUsers.delete(email), 10 * 60 * 1000);

        // Gửi email chứa mã OTP
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
        });

        res.status(201).json({ message: 'OTP sent to email. Verify to complete registration.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const pendingUser = pendingUsers.get(email);
        if (!pendingUser) {
            return res.status(404).json({ message: 'User not found or OTP expired' });
        }

        // Kiểm tra mã OTP
        if (pendingUser.otp !== otp || pendingUser.otp_expires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Lưu người dùng vào collection `User`
        const newUser = new User({
            username: pendingUser.username,
            email: pendingUser.email,
            password_hash: pendingUser.password_hash,
            avatar_url: pendingUser.avatar_url,
            bio: pendingUser.bio,
        });
        await newUser.save();

        // Xóa thông tin tạm thời khỏi bộ nhớ
        pendingUsers.delete(email);

        res.json({ message: 'User verified successfully. Registration completed.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};


// Đăng nhập người dùng
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Tạo Access Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '60m' });

        // Tạo Refresh Token
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // Lưu Refresh Token vào user
        user.refresh_token = refreshToken;
        await user.save();

        res.json({
            message: 'Login successful',
            token,           // Access Token
            refreshToken,    // Refresh Token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const user = await User.findOne({ refresh_token: refreshToken });
        if (!user) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Tạo Access Token mới
        const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '60m' });

        // Tạo Refresh Token mới
        const newRefreshToken = crypto.randomBytes(64).toString('hex');

        // Lưu Refresh Token mới
        user.refresh_token = newRefreshToken;
        await user.save();

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Refresh Token error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};

const sendResetPasswordOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Tạo OTP ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút

        // Lưu OTP và thời gian hết hạn vào user
        user.password_reset_otp = otp;
        user.password_reset_otp_expires = otpExpires;
        await user.save();

        // Gửi email chứa OTP
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
        });

        res.json({ message: 'OTP sent to email. Use it to reset your password.' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};

const resetPasswordWithOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Kiểm tra OTP
        if (
            user.password_reset_otp !== otp ||
            user.password_reset_otp_expires < Date.now()
        ) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới và xóa OTP
        user.password_hash = hashedPassword;
        user.password_reset_otp = null;
        user.password_reset_otp_expires = null;
        await user.save();

        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};


const getUser = async (req, res) => {
    try {
        // Nếu userId là chuỗi thay vì ObjectId, tìm theo chuỗi
        const user = await User.findOne({ _id: req.userId });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Trả về thông tin người dùng
        res.json(user);
    } catch (error) {
        console.error('Get User error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};

const logout = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Xóa Refresh Token
        user.refresh_token = null;
        await user.save();

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};



module.exports = { register, login, refreshAccessToken, getUser, logout, verifyOtp, sendResetPasswordOtp, resetPasswordWithOtp, sendResetPasswordOtp };

