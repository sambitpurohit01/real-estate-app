const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/keystone';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] connected to MongoDB (${uri})`);
}

module.exports = connectDB;
