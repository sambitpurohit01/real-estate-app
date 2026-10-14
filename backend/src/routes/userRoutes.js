const express = require('express');
const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { updateProfileSchema } = require('../validation/schemas');
const { me, updateProfile } = require('../controllers/userController');
const router = express.Router();
router.get('/me', protect, me);
router.put('/me', protect, validateBody(updateProfileSchema), updateProfile);
module.exports = router;
