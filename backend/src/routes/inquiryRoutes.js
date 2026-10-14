const express = require('express');
const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { inquirySchema } = require('../validation/schemas');
const { inquiryLimiter } = require('../middleware/rateLimit');
const ctrl = require('../controllers/inquiryController');
const router = express.Router();
router.post('/', inquiryLimiter, validateBody(inquirySchema), ctrl.create); // public — anyone can contact an owner
router.get('/received', protect, ctrl.myInquiries);
router.patch('/:id/read', protect, ctrl.markRead);
module.exports = router;
