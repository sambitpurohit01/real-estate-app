const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { usingCloudinary } = require('../middleware/upload');
const { cloudinary } = require('../services/cloudinary');
const { v4: uuidv4 } = require('uuid');

function streamToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'keystone', public_id: uuidv4(), transformation: [{ width: 2000, height: 2000, crop: 'limit' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    uploadStream.end(buffer);
  });
}

const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  if (usingCloudinary) {
    const result = await streamToCloudinary(req.file.buffer);
    return res.json({ url: result.secure_url });
  }

  // Local disk fallback — multer's diskStorage already wrote the file.
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = { upload };
