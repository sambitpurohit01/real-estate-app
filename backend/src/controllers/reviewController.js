const asyncHandler = require('../utils/asyncHandler');
const reviewService = require('../services/reviewService');

const getForProperty = asyncHandler(async (req, res) => {
  res.json(await reviewService.getForProperty(req.params.propertyId));
});

const getSummary = asyncHandler(async (req, res) => {
  res.json(await reviewService.summary(req.params.propertyId));
});

const create = asyncHandler(async (req, res) => {
  res.json(await reviewService.create(req.params.propertyId, req.body, req.user));
});

module.exports = { getForProperty, getSummary, create };
