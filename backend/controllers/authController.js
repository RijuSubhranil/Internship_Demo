import jwt from 'jsonwebtoken';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import User from '../models/user.js';
import { sendEmail } from '../utils/email.js';

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const getCaptcha = async (req, res) => {
  const captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
  res.status(200).json({ status: 'success', captcha });
};

export const startRegistration = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 120000; // 2 Minutes

    let user = await User.findOne({ email });
    if (user && user.isEmailVerified) return res.status(400).json({ message: 'User already verified. Please login.' });

    if (!user) {
      await User.create({ email, otp, otpExpires: expiry });
    } else {
      user.otp = otp;
      user.otpExpires = expiry;
      await user.save();
    }

    await sendEmail({ email, subject: "Your Verification Code", otp });
    res.status(200).json({ status: 'success', message: 'OTP sent to email.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) return res.status(400).json({ message: 'Invalid request.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 120000;
    await user.save();

    await sendEmail({ email, subject: "Your New OTP", otp });
    res.status(200).json({ status: 'success', message: 'OTP resent.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
        email, 
        otp, 
        otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    res.status(200).json({ status: 'success', message: 'OTP verified successfully' });
  } catch (err) { 
    res.status(400).json({ message: err.message }); 
  }
};
export const completeRegistration = async (req, res) => {
  try {
    const { email, otp, name, password, countryCode, phoneNumber, role } = req.body;

    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or Expired OTP' });

    if (!passRegex.test(password)) return res.status(400).json({ message: 'Password does not meet strength requirements' });

    const parsedPhone = parsePhoneNumberFromString(phoneNumber, countryCode);
    if (!parsedPhone || !parsedPhone.isValid()) {
      return res.status(400).json({ message: `Invalid phone number for ${countryCode}` });
    }

    user.name = name;
    user.password = password;
    user.countryCode = countryCode;
    user.phoneNumber = parsedPhone.number;
    user.role = role || 'user';
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(201).json({ status: 'success', token: signToken(user._id) });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password, captchaInput, actualCaptcha } = req.body;
    if (captchaInput !== actualCaptcha) return res.status(400).json({ message: 'Invalid Captcha' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isEmailVerified) return res.status(401).json({ message: 'Email not verified' });

    res.status(200).json({ status: 'success', token: signToken(user._id), role: user.role });
  } catch (err) { res.status(400).json({ message: err.message }); }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
   

    const user = await User.findOne({ email });
    
    if (!user) {
      
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 120000; // 2 Mins
    
    await user.save({ validateBeforeSave: false });
    
    await sendEmail({ email, subject: "Password Reset OTP", otp });

    res.status(200).json({ status: 'success', message: 'Reset OTP sent.' });

  } catch (err) { 
    res.status(400).json({ message: err.message }); 
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!passRegex.test(newPassword)) return res.status(400).json({ message: 'Weak password' });

    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or Expired OTP' });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password reset successful.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    if (req.body.email || req.body.password) {
      return res.status(400).json({ message: 'Email/Password cannot be updated here.' });
    }

    const filteredBody = {};
    const allowed = ['name', 'phoneNumber', 'countryCode'];
    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) filteredBody[key] = req.body[key];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ status: 'success', results: users.length, data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};