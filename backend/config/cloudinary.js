// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// ✅ Load .env file here as well — this ensures it's always available
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Optional: Confirm values are being loaded correctly
console.log("✅ Cloudinary connected:", process.env.CLOUDINARY_CLOUD_NAME);

module.exports = cloudinary;
