import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token:', token);
      console.log('JWT_SECRET in middleware:', process.env.JWT_SECRET ? '***set***' : '***NOT SET***');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified, decoded:', decoded);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export { protect };
