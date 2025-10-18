const serviceProviderController = require('../../controllers/serviceProviderController');
const ServiceProvider = require('../../models/ServiceProvider');
const User = require('../../models/Users');
const { cloudinary } = require('../../config/cloudinary');

// Mock dependencies
jest.mock('../../models/ServiceProvider');
jest.mock('../../models/Users');
jest.mock('../../models/ServiceListing');
jest.mock('../../config/cloudinary');

describe('Service Provider Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: 'mockUserId' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('registerAsProvider', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' }; // missing other fields
      await serviceProviderController.registerAsProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required information'
      });
    });

    it('should return 400 if user with email already exists', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        phone: '1234567890',
        serviceDescription: 'Test service',
        serviceCategory: 'mockCategoryId',
        availability: 'Weekdays'
      };
      User.findOne.mockResolvedValue({ _id: 'existingUserId' });

      await serviceProviderController.registerAsProvider(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists. Please use a different email.'
      });
    });

    it('should create a new user and service provider profile', async () => {
      const mockUser = { _id: 'newUserId', getSignedJwtToken: jest.fn().mockReturnValue('mockToken') };
      const mockServiceProvider = { _id: 'newProviderId', userId: 'newUserId' };

      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@example.com',
        password: 'password123',
        phone: '1234567890',
        serviceDescription: 'Test service',
        serviceCategory: 'mockCategoryId',
        availability: 'Weekdays',
        bankDetails: { accountNumber: '123456789' }
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      ServiceProvider.create.mockResolvedValue(mockServiceProvider);

      await serviceProviderController.registerAsProvider(req, res);

      expect(User.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@example.com',
        password: 'password123',
        phone: '1234567890',
        userType: 'service_provider'
      });

      expect(ServiceProvider.create).toHaveBeenCalledWith({
        userId: 'newUserId',
        serviceDescription: 'Test service',
        serviceCategory: 'mockCategoryId',
        availability: 'Weekdays',
        bankDetails: { accountNumber: '123456789' },
        verificationStatus: 'Pending'
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockToken',
        data: mockServiceProvider
      });
    });
  });

  describe('getProviderProfile', () => {
    it('should return 404 if profile not found', async () => {
      ServiceProvider.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await serviceProviderController.getProviderProfile(req, res);

      expect(ServiceProvider.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Service provider profile not found' });
    });

    it('should return profile if found', async () => {
      const mockServiceProvider = { _id: 'providerId', userId: 'mockUserId', serviceDescription: 'Test service' };
      ServiceProvider.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockServiceProvider) });

      await serviceProviderController.getProviderProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockServiceProvider });
    });
  });

  describe('updateProviderProfile', () => {
    it('should return 404 if profile not found', async () => {
      ServiceProvider.findOne.mockResolvedValue(null);
      await serviceProviderController.updateProviderProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Service provider profile not found' });
    });

    it('should update profile successfully', async () => {
      const mockServiceProvider = {
        _id: 'providerId',
        userId: 'mockUserId',
        serviceDescription: 'Old description',
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        serviceDescription: 'Updated description',
        serviceCategory: 'updatedCategoryId',
        availability: 'Weekends',
        availabilityDetails: { hours: '9-5' },
        bankDetails: { accountNumber: '987654321' }
      };

      ServiceProvider.findOne.mockResolvedValue(mockServiceProvider);
      await serviceProviderController.updateProviderProfile(req, res);

      expect(mockServiceProvider.serviceDescription).toBe('Updated description');
      expect(mockServiceProvider.serviceCategory).toBe('updatedCategoryId');
      expect(mockServiceProvider.availability).toBe('Weekends');
      expect(mockServiceProvider.availabilityDetails).toEqual({ hours: '9-5' });
      expect(mockServiceProvider.bankDetails).toEqual({ accountNumber: '987654321' });
      expect(mockServiceProvider.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockServiceProvider });
    });
  });

  describe('getServiceProviders', () => {
    it('should return verified providers for customers', async () => {
      req.user = { userType: 'customer' };
      const mockProviders = [{ _id: 'provider1' }, { _id: 'provider2' }];

      ServiceProvider.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProviders)
      });
      ServiceProvider.countDocuments = jest.fn().mockResolvedValue(2);

      await serviceProviderController.getServiceProviders(req, res);

      expect(ServiceProvider.find).toHaveBeenCalledWith({ verificationStatus: 'Verified' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      req.user = { userType: 'customer' };
      req.query = { category: 'categoryId', minRating: '4.5', availability: 'Weekends' };
      const mockProviders = [{ _id: 'provider1' }];

      ServiceProvider.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProviders)
      });
      ServiceProvider.countDocuments = jest.fn().mockResolvedValue(1);

      await serviceProviderController.getServiceProviders(req, res);

      expect(ServiceProvider.find).toHaveBeenCalledWith({
        verificationStatus: 'Verified',
        serviceCategory: 'categoryId',
        rating: { $gte: 4.5 },
        availability: 'Weekends'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should allow admin to see all providers', async () => {
      req.user = { userType: 'admin' };
      const mockProviders = [{ _id: 'provider1' }, { _id: 'provider2' }];

      ServiceProvider.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProviders)
      });
      ServiceProvider.countDocuments = jest.fn().mockResolvedValue(2);

      await serviceProviderController.getServiceProviders(req, res);

      expect(ServiceProvider.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
