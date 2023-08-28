const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINAY_CLOUD_NAME,
  api_key: process.env.CLOUDINAY_API_KEY,
  api_secret: process.env.CLOUDINAY_API_SECRET,
});

// Instance of cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "jpeg", "png"],
  // Optional settings for upload API call
  params: {
    folder: "blog-api",
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
  //   Or
  //   params: async (req, file) => ({
  //     folder: "blog-api",
  //     public_id: `${file.originalname}`,
  //     transformation: [{ width: 500, height: 500, crop: "limit" }],
  //   }),
});

module.exports = storage;
