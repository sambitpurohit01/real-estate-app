const express = require('express');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const ctrl = require('../controllers/fileController');
const router = express.Router();
router.post('/upload', protect, upload.single('file'), ctrl.upload);
module.exports = router;
