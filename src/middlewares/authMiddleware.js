const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        if (!decoded.userId) {
            return res.status(400).json({ message: 'Token is missing userId.' });
        }

        req.userId = decoded.userId;

        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;

