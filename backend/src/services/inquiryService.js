const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');

function serialize(inquiryDoc, propertyTitle) {
  const i = inquiryDoc.toObject ? inquiryDoc.toObject() : inquiryDoc;
  return {
    id: String(i._id),
    propertyId: String(i.property._id || i.property),
    propertyTitle: propertyTitle ?? (i.property.title || undefined),
    senderName: i.senderName,
    senderEmail: i.senderEmail,
    senderPhone: i.senderPhone,
    message: i.message,
    read: i.read,
    createdAt: i.createdAt,
  };
}

// Public — anyone (logged in or not) can contact an owner about a listing.
async function create(body) {
  if (!body.propertyId) throw new (require('../utils/AppError'))('propertyId is required', 400);
  const property = await Property.findById(body.propertyId).populate('owner', 'email fullName');
  if (!property) throw new AppError('Listing not found', 404);
  if (!body.senderName || !body.senderEmail || !body.message) {
    throw new AppError('senderName, senderEmail and message are required', 400);
  }

  const doc = await Inquiry.create({
    property: property._id,
    senderName: body.senderName,
    senderEmail: body.senderEmail,
    senderPhone: body.senderPhone || null,
    message: body.message,
  });

  emailService.sendInquiryAlert(property.owner, property, doc).catch(() => {});

  return serialize(doc, property.title);
}

async function getForOwner(user) {
  const properties = await Property.find({ owner: user._id }).select('_id title');
  const propertyMap = new Map(properties.map((p) => [String(p._id), p.title]));
  const propertyIds = properties.map((p) => p._id);
  const inquiries = await Inquiry.find({ property: { $in: propertyIds } }).sort({ createdAt: -1 });
  return inquiries.map((i) => serialize(i, propertyMap.get(String(i.property))));
}

async function markRead(id, user) {
  const inquiry = await Inquiry.findById(id).populate('property', 'owner');
  if (!inquiry) throw new AppError('Message not found', 404);
  if (String(inquiry.property.owner) !== String(user._id) && user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to update this message', 403);
  }
  inquiry.read = true;
  await inquiry.save();
}

module.exports = { create, getForOwner, markRead, serialize };
