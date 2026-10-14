// Populates demo data, matching the old Spring DataSeeder: two demo accounts
// and a handful of sample listings. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');

const SAMPLE_LISTINGS = [
  {
    title: 'Sunlit 3BHK in Koregaon Park', description: 'Bright, renovated apartment with a large balcony overlooking a quiet tree-lined street. Close to cafes and the river.',
    price: 8500000, propertyType: 'APARTMENT', listingType: 'SALE', addressLine: '14 Lane 6, Koregaon Park', city: 'Pune', state: 'Maharashtra', zipCode: '411001',
    latitude: 18.5362, longitude: 73.8939, bedrooms: 3, bathrooms: 2, areaSqft: 1450, yearBuilt: 2015,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], amenities: ['Parking', 'Gym', 'Balcony', 'Power Backup'],
  },
  {
    title: 'Modern 2BHK for Rent near Hitech City', description: 'Fully furnished, walk to the metro, great for a short commute to the tech park.',
    price: 32000, propertyType: 'APARTMENT', listingType: 'RENT', addressLine: '22 Cyber Towers Rd', city: 'Hyderabad', state: 'Telangana', zipCode: '500081',
    latitude: 17.4483, longitude: 78.3915, bedrooms: 2, bathrooms: 2, areaSqft: 1100, yearBuilt: 2019,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], amenities: ['Furnished', 'Lift', 'Security'],
  },
  {
    title: 'Independent House with Garden, Whitefield', description: 'Spacious 4BHK independent house with a private garden and covered parking for two cars.',
    price: 15500000, propertyType: 'HOUSE', listingType: 'SALE', addressLine: '7 Palm Meadows Layout', city: 'Bangalore', state: 'Karnataka', zipCode: '560066',
    latitude: 12.9698, longitude: 77.7500, bedrooms: 4, bathrooms: 3, areaSqft: 2600, yearBuilt: 2012,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'], amenities: ['Garden', 'Parking', 'Servant Room'],
  },
  {
    title: 'Compact Studio near Bandra Station', description: 'Cozy studio, ideal for a single professional. Walking distance to the station and Linking Road.',
    price: 28000, propertyType: 'APARTMENT', listingType: 'RENT', addressLine: '5 Hill Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050',
    latitude: 19.0596, longitude: 72.8295, bedrooms: 1, bathrooms: 1, areaSqft: 480, yearBuilt: 2008,
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'], amenities: ['Lift', 'Water Supply'],
  },
  {
    title: 'Riverside Plot, Ready to Build', description: '4800 sqft residential plot with clear title, road access, and river views.',
    price: 6200000, propertyType: 'LAND', listingType: 'SALE', addressLine: 'Survey No. 112, Riverside Rd', city: 'Nashik', state: 'Maharashtra', zipCode: '422005',
    latitude: 19.9975, longitude: 73.7898, bedrooms: null, bathrooms: null, areaSqft: 4800, yearBuilt: null,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], amenities: ['Gated Community'],
  },
  {
    title: 'Retail Shop, Busy Commercial Street', description: 'Ground-floor retail space on a high-footfall commercial street, previously a boutique.',
    price: 45000, propertyType: 'COMMERCIAL', listingType: 'RENT', addressLine: '18 MG Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001',
    latitude: 12.9756, longitude: 77.6060, bedrooms: null, bathrooms: 1, areaSqft: 650, yearBuilt: 2005,
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'], amenities: ['Street Facing', 'Storage'],
  },
];

async function run() {
  await connectDB();

  const existingCount = await Property.countDocuments();
  if (existingCount > 0) {
    console.log(`[seed] ${existingCount} listings already exist — skipping seed. Drop the DB first if you want to reseed.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  let agent = await User.findOne({ email: 'agent@demo.com' });
  if (!agent) {
    agent = await User.create({ fullName: 'Asha Rao', email: 'agent@demo.com', password: passwordHash, phone: '+91 98765 43210', role: 'AGENT' });
  }
  let buyer = await User.findOne({ email: 'buyer@demo.com' });
  if (!buyer) {
    buyer = await User.create({ fullName: 'Rahul Mehta', email: 'buyer@demo.com', password: passwordHash, phone: '+91 91234 56789', role: 'USER' });
  }

  await Property.insertMany(SAMPLE_LISTINGS.map((l) => ({ ...l, owner: agent._id })));

  console.log('[seed] Done.');
  console.log('[seed] Demo accounts: agent@demo.com / password123, buyer@demo.com / password123');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
