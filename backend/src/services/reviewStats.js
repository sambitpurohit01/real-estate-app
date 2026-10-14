const mongoose = require('mongoose');
const Review = require('../models/Review');

// Returns a Map<propertyIdString, {averageRating, reviewCount}> for a batch of
// property ids in one aggregation query (used by both list search and detail).
async function getStatsForProperties(propertyIds) {
  if (!propertyIds.length) return new Map();
  const ids = propertyIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await Review.aggregate([
    { $match: { property: { $in: ids } } },
    { $group: { _id: '$property', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  const map = new Map();
  rows.forEach((r) => {
    map.set(String(r._id), {
      averageRating: Math.round(r.averageRating * 10) / 10,
      reviewCount: r.reviewCount,
    });
  });
  return map;
}

async function getStatsForProperty(propertyId) {
  const map = await getStatsForProperties([propertyId]);
  return map.get(String(propertyId)) || { averageRating: 0, reviewCount: 0 };
}

module.exports = { getStatsForProperties, getStatsForProperty };
