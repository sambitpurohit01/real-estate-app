const mongoose = require('mongoose');

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL'];
const LISTING_TYPES = ['SALE', 'RENT'];
const LISTING_STATUSES = ['ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'ARCHIVED'];

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
  listingType: { type: String, enum: LISTING_TYPES, required: true },
  status: { type: String, enum: LISTING_STATUSES, default: 'ACTIVE' },

  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },

  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },

  bedrooms: { type: Number, default: null },
  bathrooms: { type: Number, default: null },
  areaSqft: { type: Number, default: null },
  yearBuilt: { type: Number, default: null },

  images: { type: [String], default: [] },
  amenities: { type: [String], default: [] },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

propertySchema.index({ city: 1, state: 1, propertyType: 1, listingType: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text', addressLine: 'text', city: 'text' });

propertySchema.statics.TYPES = { PROPERTY_TYPES, LISTING_TYPES, LISTING_STATUSES };

module.exports = mongoose.model('Property', propertySchema);
