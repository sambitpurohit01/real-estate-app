const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validation/schemas');
const { authLimiter } = require('../middleware/rateLimit');
const router = express.Router();
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
module.exports = router;
