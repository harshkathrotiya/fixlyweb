const request = require('supertest');
const app = require('../server');
const ServiceCategory = require('../models/ServiceCategory');
const User = require('../models/Users');
const mongoose = require('mongoose');

// Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  },
  categoryImageUpload: {
    single: () => (req, res, next) => {
      // Mock file upload
      req.file = {
        path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/test-category.jpg',
        originalname: 'test-category.jpg',
        size: 512 * 1024 // 512KB
      };
      next();
    }
  }
}));

describe('Category Image Upload API', () => {
  let adminToken, serviceCategory;

  beforeAll(async () => {
    // Create an admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '1234567890',
      userType: 'admin'
    });

    // Generate token
    adminToken = adminUser.getSignedJwtToken();

    // Create a service category
    serviceCategory = await ServiceCategory.create({
      categoryName: 'Test Category',
      categoryDescription: 'Test category description'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await ServiceCategory.deleteMany({});
    await mongoose.connection.close();
  });

  describe('PUT /api/categories/:id/image', () => {
    it('should upload an image for a service category', async () => {
      const response = await request(app)
        .put(`/api/categories/${serviceCategory._id}/image`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('test image content'), 'test-category.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categoryImage).toBe('https://res.cloudinary.com/demo/image/upload/v1234567890/test-category.jpg');
    });

    it('should return 404 if category not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/categories/${fakeId}/image`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('test image content'), 'test-category.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });

    it('should return 403 if user is not authorized (not admin)', async () => {
      // Create a regular user
      const regularUser = await User.create({
        firstName: 'Regular',
        lastName: 'User',
        email: 'regular@example.com',
        password: 'password123',
        phone: '1234567891',
        userType: 'user'
      });

      const regularUserToken = regularUser.getSignedJwtToken();

      const response = await request(app)
        .put(`/api/categories/${serviceCategory._id}/image`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .attach('image', Buffer.from('test image content'), 'test-category.jpg')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User role user is not authorized to access this route');
    });
  });
});