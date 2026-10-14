const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

reviewSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
