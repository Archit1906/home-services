import jwt from 'jsonwebtoken';
import { User, Worker } from '../models/index.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtsecretkey123!@#');
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    if (user.isDeleted) {
      return res.status(401).json({ success: false, message: 'Not authorized, user account is deleted' });
    }

    req.user = user;

    // If user is a worker, fetch worker profile and attach to req.worker
    if (user.role === 'worker') {
      const worker = await Worker.findOne({ where: { userId: user.id } });
      if (worker) {
        req.worker = worker;
      }
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: User role '${req.user.role}' is not authorized for this resource` 
      });
    }
    
    next();
  };
};
