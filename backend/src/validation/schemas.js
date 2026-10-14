const { z } = require('zod');

const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(200);
const password = z.string().min(6, 'Password must be at least 6 characters').max(128);

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  email,
  password,
  phone: z.string().trim().max(30).optional().nullable(),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  avatarUrl: z.string().trim().max(2000).optional().nullable(),
});

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL'];
const LISTING_TYPES = ['SALE', 'RENT'];
const LISTING_STATUSES = ['ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'ARCHIVED'];

const propertySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000).optional().default(''),
  price: z.coerce.number().positive('Price must be a positive number'),
  propertyType: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  status: z.enum(LISTING_STATUSES).optional(),
  addressLine: z.string().trim().min(1, 'Address is required').max(300),
  city: z.string().trim().min(1, 'City is required').max(120),
  state: z.string().trim().min(1, 'State is required').max(120),
  zipCode: z.string().trim().min(1, 'Zip code is required').max(20),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).max(100).optional().nullable(),
  bathrooms: z.coerce.number().min(0).max(100).optional().nullable(),
  areaSqft: z.coerce.number().positive().optional().nullable(),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  images: z.array(z.string().trim().max(2000)).max(30).optional().default([]),
  amenities: z.array(z.string().trim().max(80)).max(50).optional().default([]),
});

const propertyUpdateSchema = propertySchema.partial();

const inquirySchema = z.object({
  propertyId: z.string().trim().min(1, 'propertyId is required'),
  senderName: z.string().trim().min(1, 'Name is required').max(120),
  senderEmail: email,
  senderPhone: z.string().trim().max(30).optional().nullable(),
  message: z.string().trim().min(1, 'Message is required').max(3000),
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5),
  comment: z.string().trim().max(2000).optional().default(''),
});

const agentChatSchema = z.object({
  message: z.string().trim().min(1, 'message is required').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      })
    )
    .max(40)
    .optional()
    .default([]),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  propertySchema,
  propertyUpdateSchema,
  inquirySchema,
  reviewSchema,
  agentChatSchema,
};
