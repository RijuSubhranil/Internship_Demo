
import express from 'express';
import { 
  startRegistration, resendOTP, completeRegistration, 
  login, getCaptcha, forgotPassword, resetPassword, verifyRegistrationOTP, getMe, updateMe, deleteUser, getAllUsers
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/captcha:
 *   get:
 *     summary: Generate a new alphanumeric captcha
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Captcha generated successfully
 */
router.get('/captcha', getCaptcha);

/**
 * @swagger
 * /api/v1/auth/register-start:
 *   post:
 *     summary: Step 1 of registration - Send OTP to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: User already verified or invalid input
 */
router.post('/register-start', startRegistration);

/**
 * @swagger
 * /api/v1/auth/resend-otp:
 *   post:
 *     summary: Resend verification OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: New OTP sent
 */
router.post('/resend-otp', resendOTP);

/**
 * @swagger
 * /api/v1/auth/register-complete:
 *   post:
 *     summary: Complete registration with OTP and user details
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - name
 *               - password
 *               - countryCode
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               countryCode:
 *                 type: string
 *                 example: IN
 *               phoneNumber:
 *                 type: string
 *                 example: 9876543210
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid OTP or weak password
 */
router.post('/register-complete', completeRegistration);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email, password, and captcha
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - captchaInput
 *               - actualCaptcha
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               captchaInput:
 *                 type: string
 *               actualCaptcha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset OTP sent
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP before allowing profile completion
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP is valid
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', verifyRegistrationOTP);
/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current logged-in user profile details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile fetched
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/v1/auth/update-me:
 *   patch:
 *     summary: Update current user profile (excluding email)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               countryCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/update-me', protect, updateMe);
/**
 * @swagger
 * /api/v1/auth/all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/all-users', protect, restrictTo('admin'), getAllUsers);

/**
 * @swagger
 * /api/v1/auth/{id}:
 *   delete:
 *     summary: Delete a user by ID (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete('/:id', protect, restrictTo('admin'), deleteUser);


export default router;