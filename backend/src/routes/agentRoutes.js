const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { agentChatSchema } = require('../validation/schemas');
const { agentLimiter } = require('../middleware/rateLimit');
const { chat } = require('../controllers/agentController');
const router = express.Router();
// optionalAuth first so agentLimiter can key its limit on the logged-in user, not just IP
router.post('/chat', optionalAuth, agentLimiter, validateBody(agentChatSchema), chat);
module.exports = router;
