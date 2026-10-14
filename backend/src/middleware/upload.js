// Two storage backends, chosen automatically:
//  - Cloudinary (when CLOUDINARY_* env vars are set) — durable, works on any host,
//    required for real deployments (most hosting platforms wipe local disk on
//    every redeploy/restart, or run multiple instances with no shared disk).
//    Files are parsed into memory by multer, then streamed up in fileController.
//  - Local disk (fallback) — convenient for local development with zero setup,
//    but NOT suitable for production. env.js warns loudly if this is active
//    in production.
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { isConfigured } = require('../services/cloudinary');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error('Only image uploads (jpeg, png, webp, gif) are allowed'));
  }
  cb(null, true);
};
const limits = { fileSize: 8 * 1024 * 1024 };

const usingCloudinary = isConfigured();
let uploadDir = null;
let storage;

if (usingCloudinary) {
  storage = multer.memoryStorage();
} else {
  uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  });
}

const upload = multer({ storage, limits, fileFilter });

module.exports = { upload, uploadDir, usingCloudinary };
