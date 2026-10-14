const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// Requires a valid token; 401s otherwise. Loads the full user doc onto req.user
// (password excluded) so controllers can use req.user just like the old
// Spring `@AuthenticationPrincipal UserPrincipal principal.getUser()`.
const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new AppError('Not authenticated', 401);
  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    throw new AppError('Invalid or expired token', 401);
  }
  const user = await User.findById(payload.sub).select('-password');
  if (!user) throw new AppError('User no longer exists', 401);
  req.user = user;
  next();
});

// Like protect, but never throws — just attaches req.user if a valid token is
// present. Used by the AI agent endpoint, which works for guests too.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select('-password');
    if (user) req.user = user;
  } catch (e) {
    // ignore bad/expired token for optional auth
  }
  next();
});

module.exports = { protect, optionalAuth };
