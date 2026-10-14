const Favorite = require('../models/Favorite');
const propertyService = require('./propertyService');
const AppError = require('../utils/AppError');

async function getFavorites(user) {
  const favs = await Favorite.find({ user: user._id }).sort({ createdAt: -1 });
  const results = await Promise.all(
    favs.map((f) => propertyService.getById(f.property).catch(() => null))
  );
  return results.filter(Boolean);
}

async function addFavorite(user, propertyId) {
  await propertyService.getRawById(propertyId); // 404s if the listing doesn't exist
  try {
    await Favorite.create({ user: user._id, property: propertyId });
  } catch (e) {
    if (e.code === 11000) return; // already favorited — idempotent, matches old behavior
    throw e;
  }
}

async function removeFavorite(user, propertyId) {
  await Favorite.deleteOne({ user: user._id, property: propertyId });
}

module.exports = { getFavorites, addFavorite, removeFavorite };
