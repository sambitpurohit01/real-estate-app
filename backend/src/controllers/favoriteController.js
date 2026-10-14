const asyncHandler = require('../utils/asyncHandler');
const favoriteService = require('../services/favoriteService');

const getFavorites = asyncHandler(async (req, res) => {
  res.json(await favoriteService.getFavorites(req.user));
});

const addFavorite = asyncHandler(async (req, res) => {
  await favoriteService.addFavorite(req.user, req.params.propertyId);
  res.json({});
});

const removeFavorite = asyncHandler(async (req, res) => {
  await favoriteService.removeFavorite(req.user, req.params.propertyId);
  res.status(204).send();
});

module.exports = { getFavorites, addFavorite, removeFavorite };
