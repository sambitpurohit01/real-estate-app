const asyncHandler = require('../utils/asyncHandler');
const propertyService = require('../services/propertyService');

const search = asyncHandler(async (req, res) => {
  const { city, state, propertyType, listingType, minPrice, maxPrice, minBedrooms, minBathrooms, keyword,
    page = 0, size = 12, sortBy = 'createdAt', direction = 'desc' } = req.query;

  const result = await propertyService.search(
    { city, state, propertyType, listingType, minPrice, maxPrice, minBedrooms, minBathrooms, keyword },
    { page, size, sortBy, direction }
  );
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  res.json(await propertyService.getById(req.params.id));
});

const myListings = asyncHandler(async (req, res) => {
  res.json(await propertyService.getByOwner(req.user._id));
});

const create = asyncHandler(async (req, res) => {
  res.json(await propertyService.create(req.body, req.user));
});

const update = asyncHandler(async (req, res) => {
  res.json(await propertyService.update(req.params.id, req.body, req.user));
});

const remove = asyncHandler(async (req, res) => {
  await propertyService.remove(req.params.id, req.user);
  res.status(204).send();
});

module.exports = { search, getById, myListings, create, update, remove };
