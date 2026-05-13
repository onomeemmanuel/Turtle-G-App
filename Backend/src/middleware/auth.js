const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'turtleg_secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    await User.findByIdAndUpdate(decoded.id, { lastActive: Date.now() });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
