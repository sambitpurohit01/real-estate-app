const rateLimit = require('express-rate-limit');

// Generous baseline for normal browsing/reads across the whole API.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down and try again shortly.' },
});

// Tight limit on auth endpoints — this is what stops brute-force login/registration abuse.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts toward the limit
  message: { message: 'Too many attempts. Please wait 15 minutes and try again.' },
});

// The AI agent calls an external LLM API on every request — this protects your
// Gemini quota/bill from being exhausted by one user (or a script) hammering it.
const agentLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user._id}` : req.ip),
  message: { message: "You're sending messages too quickly — please wait a moment." },
});

// Anyone can submit an inquiry without logging in — cap it to stop spam floods
// to property owners' inboxes.
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' },
});

module.exports = { generalLimiter, authLimiter, agentLimiter, inquiryLimiter };
