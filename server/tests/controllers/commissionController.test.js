const commissionController = require('../../controllers/commissionController');
const Commission = require('../../models/Commission');
const ServiceProvider = require('../../models/ServiceProvider');

// Mock dependencies
jest.mock('../../models/Commission');
jest.mock('../../models/ServiceProvider');

describe('Commission Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      body: {},
      params: {},
      user: { 
        id: 'admin123',
        userType: 'admin'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllCommissions', () => {
    it('should return all commissions', async () => {
      // Arrange
      const mockCommissions = [
        { _id: 'commission1', serviceProviderId: 'provider1' },
        { _id: 'commission2', serviceProviderId: 'provider2' }
      ];
      
      Commission.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCommissions)
      });
      
      // Act
      await commissionController.getAllCommissions(req, res);
      
      // Assert
      expect(Commission.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockCommissions
      });
    });
  });

  describe('getProviderCommissions', () => {
    it('should return commissions for a specific provider', async () => {
      // Arrange
      req.params.providerId = 'provider123';
      
      const mockCommissions = [
        { _id: 'commission1', serviceProviderId: 'provider123' },
        { _id: 'commission2', serviceProviderId: 'provider123' }
      ];
      
      Commission.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCommissions)
      });
      
      // Act
      await commissionController.getProviderCommissions(req, res);
      
      // Assert
      expect(Commission.find).toHaveBeenCalledWith({ serviceProviderId: 'provider123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockCommissions
      });
    });
  });

  describe('getCommissionById', () => {
    it('should return 404 if commission not found', async () => {
      // Arrange
      req.params.id = 'nonexistent123';
      
      Commission.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      
      // Act
      await commissionController.getCommissionById(req, res);
      
      // Assert
      expect(Commission.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Commission not found'
      });
    });

    it('should return commission details if found', async () => {
      // Arrange
      req.params.id = 'commission123';
      
      const mockCommission = {
        _id: 'commission123',
        serviceProviderId: {
          _id: 'provider123',
          userId: {
            firstName: 'John',
            lastName: 'Doe'
          },
          businessName: 'John\'s Services'
        },
        commissionRate: 10,
        amount: 100
      };
      
      Commission.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCommission)
      });
      
      // Act
      await commissionController.getCommissionById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCommission
      });
    });
  });

  describe('updateCommission', () => {
    it('should return 404 if commission not found', async () => {
      // Arrange
      req.params.id = 'nonexistent123';
      req.body = { commissionRate: 15 };
      
      Commission.findById.mockResolvedValue(null);
      
      // Act
      await commissionController.updateCommission(req, res);
      
      // Assert
      expect(Commission.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Commission not found'
      });
    });

    it('should update commission successfully', async () => {
      // Arrange
      req.params.id = 'commission123';
      req.body = { 
        commissionRate: 15,
        amount: 150
      };
      
      const mockCommission = {
        _id: 'commission123',
        commissionRate: 10,
        amount: 100
      };
      
      const updatedMockCommission = {
        _id: 'commission123',
        commissionRate: 15,
        amount: 150
      };
      
      Commission.findById.mockResolvedValue(mockCommission);
      Commission.findByIdAndUpdate.mockResolvedValue(updatedMockCommission);
      
      // Act
      await commissionController.updateCommission(req, res);
      
      // Assert
      expect(Commission.findByIdAndUpdate).toHaveBeenCalledWith(
        'commission123',
        { commissionRate: 15, amount: 150 },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedMockCommission
      });
    });
  });
});