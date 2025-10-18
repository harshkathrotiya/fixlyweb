const serviceListingController = require('../../controllers/serviceListingController');
const ServiceListing = require('../../models/ServiceListing');
const ServiceProvider = require('../../models/ServiceProvider');
const { cloudinary } = require('../../config/cloudinary');

// Mock the required models and dependencies
jest.mock('../../models/ServiceListing');
jest.mock('../../models/ServiceProvider');
jest.mock('../../config/cloudinary', () => ({
  cloudinary: { uploader: { upload: jest.fn(), destroy: jest.fn() } }
}));

describe('Service Listing Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, file: {}, user: { id: 'user123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // -------------------
  // createListing
  // -------------------
  describe('createListing', () => {
    it('should return 404 if service provider profile not found', async () => {
      req.body = { categoryId: 'category123', serviceTitle: 'Plumbing Service' };
      ServiceProvider.findOne.mockResolvedValue(null);

      await serviceListingController.createListing(req, res);

      expect(ServiceProvider.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service provider profile not found. Please complete your profile first.'
      });
    });
  });

  // -------------------
  // updateListing
  // -------------------
  describe('updateListing', () => {
    it('should return 404 if listing not found', async () => {
      req.params.id = 'nonexistent';
      req.user.id = 'user123';
      ServiceListing.findById.mockResolvedValue(null);

      await serviceListingController.updateListing(req, res);

      expect(ServiceListing.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service listing not found'
      });
    });
  });

  // -------------------
  // deleteListing
  // -------------------
  describe('deleteListing', () => {
    it('should return 404 if listing not found', async () => {
      req.params.id = 'nonexistent';
      req.user.id = 'user123';
      ServiceListing.findById.mockResolvedValue(null);

      await serviceListingController.deleteListing(req, res);

      expect(ServiceListing.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service listing not found'
      });
    });
  });
});
