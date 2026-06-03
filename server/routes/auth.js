import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Worker } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Mock OTP store: phone -> otp
const otpStore = new Map();

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtsecretkey123!@#', {
    expiresIn: '30d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (homeowner or worker)
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      city,
      role: role || 'user'
    });

    let worker = null;

    // If role is worker, initialize worker profile
    if (user.role === 'worker') {
      worker = await Worker.create({
        userId: user.id,
        headline: 'Experienced service professional',
        skills: [],
        experience: 0,
        languages: ['English'],
        availabilityCalendar: [
          { day: 'Monday', slots: ['09:00-17:00'] },
          { day: 'Tuesday', slots: ['09:00-17:00'] },
          { day: 'Wednesday', slots: ['09:00-17:00'] },
          { day: 'Thursday', slots: ['09:00-17:00'] },
          { day: 'Friday', slots: ['09:00-17:00'] }
        ]
      });
    }

    const token = signToken(user.id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        photoURL: user.photoURL
      },
      worker
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    let worker = null;

    if (user.role === 'worker') {
      worker = await Worker.findOne({ where: { userId: user.id } });
    }

    // Exclude password from the user object in response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      photoURL: user.photoURL
    };

    return res.json({
      success: true,
      token,
      user: userResponse,
      worker
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/send-otp
 * @desc    Simulate sending OTP to phone number
 */
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, otp);

    console.log(`\n--- [SIMULATED SMS] ---`);
    console.log(`To: ${phone}`);
    console.log(`Message: Your HomeConnect OTP code is: ${otp}`);
    console.log(`-----------------------\n`);

    return res.json({
      success: true,
      message: 'OTP sent successfully (simulated)',
      otp: process.env.NODE_ENV === 'production' ? undefined : otp 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Simulate verifying OTP
 */
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const storedOtp = otpStore.get(phone);

    if (storedOtp && storedOtp === otp) {
      otpStore.delete(phone); 
      return res.json({ success: true, message: 'OTP verified successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user info
 */
router.get('/me', protect, async (req, res, next) => {
  try {
    // Exclude password field from req.user
    const user = req.user.toJSON();
    delete user.password;
    const worker = req.worker || null;
    return res.json({ success: true, user, worker });
  } catch (error) {
    next(error);
  }
});

export default router;
