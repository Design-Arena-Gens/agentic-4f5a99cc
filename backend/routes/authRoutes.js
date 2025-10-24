import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
