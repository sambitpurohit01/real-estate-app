const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

function toBody(user) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

const me = asyncHandler(async (req, res) => {
  res.json(toBody(req.user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, avatarUrl } = req.body;
  if (!fullName) throw new AppError('fullName is required', 400);
  req.user.fullName = fullName;
  req.user.phone = phone;
  req.user.avatarUrl = avatarUrl;
  await req.user.save();
  res.json(toBody(req.user));
});

module.exports = { me, updateProfile };
