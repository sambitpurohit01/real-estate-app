const Review = require('../models/Review');
const Property = require('../models/Property');
const AppError = require('../utils/AppError');
const { getStatsForProperty } = require('./reviewStats');

function serialize(reviewDoc) {
  const r = reviewDoc.toObject ? reviewDoc.toObject() : reviewDoc;
  const user = r.user && r.user.fullName ? r.user : null;
  return {
    id: String(r._id),
    rating: r.rating,
    comment: r.comment,
    userId: user ? String(user._id) : String(r.user),
    userName: user ? user.fullName : undefined,
    userAvatarUrl: user ? user.avatarUrl : undefined,
    createdAt: r.createdAt,
  };
}

async function getForProperty(propertyId) {
  const reviews = await Review.find({ property: propertyId }).populate('user', 'fullName avatarUrl').sort({ createdAt: -1 });
  return reviews.map(serialize);
}

async function summary(propertyId) {
  const stats = await getStatsForProperty(propertyId);
  return { averageRating: stats.averageRating, reviewCount: stats.reviewCount };
}

async function create(propertyId, body, user) {
  const property = await Property.findById(propertyId);
  if (!property) throw new AppError('Listing not found', 404);
  if (String(property.owner) === String(user._id)) {
    throw new AppError('You cannot review your own listing', 400);
  }
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    throw new AppError('rating must be between 1 and 5', 400);
  }
  let doc;
  try {
    doc = await Review.create({
      property: propertyId,
      user: user._id,
      rating: body.rating,
      comment: body.comment || '',
    });
  } catch (e) {
    if (e.code === 11000) throw new AppError('You have already reviewed this listing', 400);
    throw e;
  }
  await doc.populate('user', 'fullName avatarUrl');
  return serialize(doc);
}

module.exports = { getForProperty, summary, create };
