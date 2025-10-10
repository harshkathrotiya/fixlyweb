const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log Cloudinary configuration status
console.log('Cloudinary configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
});

// Set up storage for different types of uploads
const createStorage = (folder, transformation = [{ width: 800, height: 600, crop: 'fill', gravity: 'auto' }]) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `fixly/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: transformation
    }
  });
};

// Create upload middleware for different types
const categoryImageUpload = multer({
  storage: createStorage('categories', [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }]), // Square images for categories
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const serviceImageUpload = multer({
  storage: createStorage('services'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const profileImageUpload = multer({
  storage: createStorage('profiles'),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const documentUpload = multer({
  storage: createStorage('documents'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = {
  cloudinary,
  categoryImageUpload,
  serviceImageUpload,
  profileImageUpload,
  documentUpload
};