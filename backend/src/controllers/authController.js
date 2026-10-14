const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const emailService = require('../services/emailService');

function toAuthResponse(user, token) {
  return {
    token,
    userId: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  if (!fullName || !email || !password) throw new AppError('fullName, email and password are required', 400);
  if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('An account with this email already exists', 400);

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email: email.toLowerCase(), password: hashed, phone });

  emailService.sendWelcomeEmail(user).catch(() => {});

  const token = signToken(user._id);
  res.json(toAuthResponse(user, token));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('email and password are required', 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('Invalid email or password', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid email or password', 401);

  const token = signToken(user._id);
  res.json(toAuthResponse(user, token));
});

module.exports = { register, login };
