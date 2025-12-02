const request = require('supertest');
const app = require('../server');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/Users');
const mongoose = require('mongoose');

// Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  },
  profileImageUpload: {
    single: () => (req, res, next) => {
      // Mock file upload
      req.file = {
        path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/test-profile.jpg',
        originalname: 'test-profile.jpg',
        size: 512 * 1024 // 512KB
      };
      next();
    }
  }
}));

describe('Provider Profile Image Upload API', () => {
  let userToken, serviceProvider;

  beforeAll(async () => {
    // Create a service provider user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'Provider',
      email: 'testprovider@example.com',
      password: 'password123',
      phone: '1234567890',
      userType: 'service_provider'
    });

    serviceProvider = await ServiceProvider.create({
      userId: user._id,
      serviceDescription: 'Test service description',
      serviceCategory: new mongoose.Types.ObjectId(),
      verificationStatus: 'Verified'
    });

    // Generate token
    userToken = user.getSignedJwtToken();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await ServiceProvider.deleteMany({});
    await mongoose.connection.close();
  });

  describe('PUT /api/providers/profile/image', () => {
    it('should upload a profile image for a service provider', async () => {
      const response = await request(app)
        .put('/api/providers/profile/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', Buffer.from('test image content'), 'test-profile.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId.profilePicture).toBe('https://res.cloudinary.com/demo/image/upload/v1234567890/test-profile.jpg');
    });

    it('should return 400 if no image file is provided', async () => {
      // Mock no file upload
      jest.mock('../config/cloudinary', () => ({
        profileImageUpload: {
          single: () => (req, res, next) => {
            req.file = null;
            next();
          }
        }
      }));

      const response = await request(app)
        .put('/api/providers/profile/image')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please upload an image');
    });

    it('should return 404 if service provider profile not found', async () => {
      // Create another user without a service provider profile
      const otherUser = await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: 'otheruser@example.com',
        password: 'password123',
        phone: '1234567891',
        userType: 'service_provider'
      });

      const otherUserToken = otherUser.getSignedJwtToken();

      const response = await request(app)
        .put('/api/providers/profile/image')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .attach('image', Buffer.from('test image content'), 'test-profile.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Service provider profile not found');
    });
  });
});