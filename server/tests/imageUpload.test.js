const request = require('supertest');
const app = require('../server');
const ServiceListing = require('../models/ServiceListing');
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
  serviceImageUpload: {
    single: () => (req, res, next) => {
      // Mock file upload
      req.file = {
        path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/test-image.jpg',
        originalname: 'test-image.jpg',
        size: 1024 * 1024 // 1MB
      };
      next();
    }
  }
}));

describe('Image Upload and Delete APIs', () => {
  let userToken, serviceProvider, serviceListing;

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

    // Create a service listing
    serviceListing = await ServiceListing.create({
      serviceProviderId: serviceProvider._id,
      categoryId: new mongoose.Types.ObjectId(),
      serviceTitle: 'Test Service',
      servicePrice: 100,
      serviceDetails: 'Test service details'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await ServiceProvider.deleteMany({});
    await ServiceListing.deleteMany({});
    await mongoose.connection.close();
  });

  describe('PUT /api/listings/:id/image', () => {
    it('should upload an image for a service listing', async () => {
      const response = await request(app)
        .put(`/api/listings/${serviceListing._id}/image`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', Buffer.from('test image content'), 'test-image.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceImage).toBe('https://res.cloudinary.com/demo/image/upload/v1234567890/test-image.jpg');
    });

    it('should return 404 if listing not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/listings/${fakeId}/image`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', Buffer.from('test image content'), 'test-image.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Service listing not found');
    });

    it('should return 403 if user is not authorized to update the listing', async () => {
      // Create another user
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
        .put(`/api/listings/${serviceListing._id}/image`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .attach('image', Buffer.from('test image content'), 'test-image.jpg')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not authorized to update this listing');
    });
  });

  describe('DELETE /api/listings/:id/image', () => {
    it('should delete an image from a service listing', async () => {
      // First upload an image
      await ServiceListing.findByIdAndUpdate(serviceListing._id, {
        serviceImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/test-image.jpg'
      });

      const response = await request(app)
        .delete(`/api/listings/${serviceListing._id}/image`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceImage).toBe('');
    });

    it('should return 404 if listing not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/listings/${fakeId}/image`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Service listing not found');
    });

    it('should return 403 if user is not authorized to update the listing', async () => {
      // Create another user
      const otherUser = await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: 'otheruser2@example.com',
        password: 'password123',
        phone: '1234567892',
        userType: 'service_provider'
      });

      const otherUserToken = otherUser.getSignedJwtToken();

      const response = await request(app)
        .delete(`/api/listings/${serviceListing._id}/image`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not authorized to update this listing');
    });
  });
});