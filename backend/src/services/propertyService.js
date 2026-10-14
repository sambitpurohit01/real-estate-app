const Property = require('../models/Property');
const AppError = require('../utils/AppError');
const { getStatsForProperties, getStatsForProperty } = require('./reviewStats');

// Serializes a populated Property doc (owner populated) into the exact shape
// the React frontend expects (matches the old Spring PropertyResponse DTO).
function serialize(propertyDoc, stats) {
  const p = propertyDoc.toObject ? propertyDoc.toObject() : propertyDoc;
  const owner = p.owner && p.owner.fullName ? p.owner : null; // populated or not
  return {
    id: String(p._id),
    title: p.title,
    description: p.description,
    price: p.price,
    propertyType: p.propertyType,
    listingType: p.listingType,
    status: p.status,
    addressLine: p.addressLine,
    city: p.city,
    state: p.state,
    zipCode: p.zipCode,
    latitude: p.latitude,
    longitude: p.longitude,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqft: p.areaSqft,
    yearBuilt: p.yearBuilt,
    images: p.images || [],
    amenities: p.amenities || [],
    ownerId: owner ? String(owner._id) : String(p.owner),
    ownerName: owner ? owner.fullName : undefined,
    ownerPhone: owner ? owner.phone : undefined,
    ownerAvatarUrl: owner ? owner.avatarUrl : undefined,
    averageRating: stats ? stats.averageRating : 0,
    reviewCount: stats ? stats.reviewCount : 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function buildFilter(criteria = {}) {
  const filter = { status: { $ne: 'ARCHIVED' } };
  if (criteria.city) filter.city = new RegExp(`^${escapeRegex(criteria.city)}$`, 'i');
  if (criteria.state) filter.state = new RegExp(`^${escapeRegex(criteria.state)}$`, 'i');
  if (criteria.propertyType) filter.propertyType = criteria.propertyType;
  if (criteria.listingType) filter.listingType = criteria.listingType;
  if (criteria.minPrice != null || criteria.maxPrice != null) {
    filter.price = {};
    if (criteria.minPrice != null) filter.price.$gte = Number(criteria.minPrice);
    if (criteria.maxPrice != null) filter.price.$lte = Number(criteria.maxPrice);
  }
  if (criteria.minBedrooms != null) filter.bedrooms = { $gte: Number(criteria.minBedrooms) };
  if (criteria.minBathrooms != null) filter.bathrooms = { $gte: Number(criteria.minBathrooms) };
  if (criteria.keyword) {
    const kw = escapeRegex(criteria.keyword);
    filter.$or = [
      { title: new RegExp(kw, 'i') },
      { description: new RegExp(kw, 'i') },
      { addressLine: new RegExp(kw, 'i') },
      { city: new RegExp(kw, 'i') },
    ];
  }
  return filter;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SORTABLE_FIELDS = new Set(['createdAt', 'price', 'title', 'bedrooms', 'areaSqft']);

// criteria: { city, state, propertyType, listingType, minPrice, maxPrice, minBedrooms, minBathrooms, keyword }
// paging: { page (0-indexed), size, sortBy, direction }
async function search(criteria, paging) {
  const filter = buildFilter(criteria);
  const page = Math.max(0, parseInt(paging.page, 10) || 0);
  const size = Math.min(100, Math.max(1, parseInt(paging.size, 10) || 12));
  const sortBy = SORTABLE_FIELDS.has(paging.sortBy) ? paging.sortBy : 'createdAt';
  const direction = paging.direction === 'asc' ? 1 : -1;

  const [docs, totalElements] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'fullName phone avatarUrl')
      .sort({ [sortBy]: direction })
      .skip(page * size)
      .limit(size),
    Property.countDocuments(filter),
  ]);

  const statsMap = await getStatsForProperties(docs.map((d) => d._id));
  const content = docs.map((d) => serialize(d, statsMap.get(String(d._id))));
  const totalPages = Math.ceil(totalElements / size);

  return { content, totalElements, totalPages, page, size };
}

async function getById(id) {
  const doc = await Property.findById(id).populate('owner', 'fullName phone avatarUrl');
  if (!doc) throw new AppError('Listing not found', 404);
  const stats = await getStatsForProperty(id);
  return serialize(doc, stats);
}

// Internal helper (not serialized) — used for ownership checks by other services.
async function getRawById(id) {
  const doc = await Property.findById(id);
  if (!doc) throw new AppError('Listing not found', 404);
  return doc;
}

async function getByOwner(ownerId) {
  const docs = await Property.find({ owner: ownerId }).populate('owner', 'fullName phone avatarUrl').sort({ createdAt: -1 });
  const statsMap = await getStatsForProperties(docs.map((d) => d._id));
  return docs.map((d) => serialize(d, statsMap.get(String(d._id))));
}

function assertOwnerOrAdmin(property, user) {
  const isOwner = String(property.owner) === String(user._id);
  const isAdmin = user.role === 'ADMIN';
  if (!isOwner && !isAdmin) throw new AppError('You do not have permission to modify this listing', 403);
}

const REQUIRED_FIELDS = ['title', 'price', 'propertyType', 'listingType', 'addressLine', 'city', 'state', 'zipCode'];

function validate(body) {
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new AppError(`${field} is required`, 400);
    }
  }
  if (Number.isNaN(Number(body.price)) || Number(body.price) <= 0) {
    throw new AppError('price must be a positive number', 400);
  }
  if (!Property.TYPES.PROPERTY_TYPES.includes(body.propertyType)) {
    throw new AppError('Invalid propertyType', 400);
  }
  if (!Property.TYPES.LISTING_TYPES.includes(body.listingType)) {
    throw new AppError('Invalid listingType', 400);
  }
}

async function create(body, ownerUser) {
  validate(body);
  const doc = await Property.create({
    title: body.title,
    description: body.description || '',
    price: body.price,
    propertyType: body.propertyType,
    listingType: body.listingType,
    status: body.status || 'ACTIVE',
    addressLine: body.addressLine,
    city: body.city,
    state: body.state,
    zipCode: body.zipCode,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    bedrooms: body.bedrooms ?? null,
    bathrooms: body.bathrooms ?? null,
    areaSqft: body.areaSqft ?? null,
    yearBuilt: body.yearBuilt ?? null,
    images: body.images || [],
    amenities: body.amenities || [],
    owner: ownerUser._id,
  });
  return getById(doc._id);
}

async function update(id, body, user) {
  const doc = await getRawById(id);
  assertOwnerOrAdmin(doc, user);
  validate({ ...doc.toObject(), ...body });

  const fields = ['title', 'description', 'price', 'propertyType', 'listingType', 'status',
    'addressLine', 'city', 'state', 'zipCode', 'latitude', 'longitude', 'bedrooms',
    'bathrooms', 'areaSqft', 'yearBuilt', 'images', 'amenities'];
  fields.forEach((f) => {
    if (body[f] !== undefined) doc[f] = body[f];
  });
  await doc.save();
  return getById(doc._id);
}

async function remove(id, user) {
  const doc = await getRawById(id);
  assertOwnerOrAdmin(doc, user);
  await doc.deleteOne();
}

module.exports = { search, getById, getRawById, getByOwner, create, update, remove, serialize, assertOwnerOrAdmin };
