// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

// Đăng ký người dùng
router.post('/register', userController.register);

// Xác thực mã OTP
router.post('/verify-otp', userController.verifyOtp);

// Đăng nhập người dùng
router.post('/login', userController.login);

// Cấp lại Access Token
router.post('/refresh-token', userController.refreshAccessToken);

// Route gửi OTP để đặt lại mật khẩu
router.post('/send-reset-password-otp', userController.sendResetPasswordOtp);

// Route đặt lại mật khẩu với OTP
router.post('/reset-password', userController.resetPasswordWithOtp);

// Lấy thông tin người dùng
router.get('/user', authenticateToken, userController.getUser);

// Đăng xuất
router.post('/logout', authenticateToken, userController.logout);

module.exports = router;
