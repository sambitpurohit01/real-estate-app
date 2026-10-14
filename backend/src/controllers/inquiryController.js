const asyncHandler = require('../utils/asyncHandler');
const inquiryService = require('../services/inquiryService');
const AppError = require('../utils/AppError');

const create = asyncHandler(async (req, res) => {
  res.json(await inquiryService.create(req.body));
});

const myInquiries = asyncHandler(async (req, res) => {
  res.json(await inquiryService.getForOwner(req.user));
});

const markRead = asyncHandler(async (req, res) => {
  await inquiryService.markRead(req.params.id, req.user);
  res.status(204).send();
});

module.exports = { create, myInquiries, markRead };
