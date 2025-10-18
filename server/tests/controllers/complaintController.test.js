const complaintController = require('../../controllers/complaintController');
const Complaint = require('../../models/Complaint');
const Booking = require('../../models/Booking');
const mongoose = require('mongoose');

// Mock the required models and dependencies
jest.mock('../../models/Complaint');
jest.mock('../../models/Booking');

describe('Complaint Controller', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: '60d0fe4f5311236168a109ca',
        userType: 'customer'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createComplaint', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { bookingId: '60d0fe4f5311236168a109cb' };
      await complaintController.createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });
    
    it('should return 404 if booking is not found', async () => {
      req.body = {
        bookingId: '60d0fe4f5311236168a109cb',
        complaintText: 'Service was not completed properly'
      };
      Booking.findById.mockResolvedValue(null);
      await complaintController.createComplaint(req, res);
      expect(Booking.findById).toHaveBeenCalledWith('60d0fe4f5311236168a109cb');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking not found'
      });
    });
    
    it('should return 403 if booking does not belong to the customer', async () => {
      req.body = {
        bookingId: '60d0fe4f5311236168a109cb',
        complaintText: 'Service was not completed properly'
      };
      Booking.findById.mockResolvedValue({
        _id: '60d0fe4f5311236168a109cb',
        customerId: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cc')
      });
      await complaintController.createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to file a complaint for this booking'
      });
    });
    
    it('should return 400 if complaint already exists for the booking', async () => {
      req.body = {
        bookingId: '60d0fe4f5311236168a109cb',
        complaintText: 'Service was not completed properly'
      };
      Booking.findById.mockResolvedValue({
        _id: '60d0fe4f5311236168a109cb',
        customerId: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca')
      });
      Complaint.findOne.mockResolvedValue({ _id: '60d0fe4f5311236168a109cd' });
      await complaintController.createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Complaint already exists for this booking'
      });
    });
    
    it('should create a complaint successfully', async () => {
      req.body = {
        bookingId: '60d0fe4f5311236168a109cb',
        complaintText: 'Service was not completed properly'
      };
      Booking.findById.mockResolvedValue({
        _id: '60d0fe4f5311236168a109cb',
        customerId: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca')
      });
      Complaint.findOne.mockResolvedValue(null);
      const createdComplaint = {
        _id: '60d0fe4f5311236168a109cd',
        bookingId: '60d0fe4f5311236168a109cb',
        customerId: '60d0fe4f5311236168a109ca',
        complaintText: 'Service was not completed properly',
        complaintStatus: 'Pending'
      };
      Complaint.create.mockResolvedValue(createdComplaint);
      await complaintController.createComplaint(req, res);
      expect(Complaint.create).toHaveBeenCalledWith({
        bookingId: '60d0fe4f5311236168a109cb',
        customerId: '60d0fe4f5311236168a109ca',
        complaintText: 'Service was not completed properly'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdComplaint
      });
    });
  });
  
  describe('getCustomerComplaints', () => {
    it('should return all complaints for a customer', async () => {
      const mockComplaints = [
        {
          _id: '60d0fe4f5311236168a109cd',
          bookingId: {
            _id: '60d0fe4f5311236168a109cb',
            serviceListingId: { serviceTitle: 'Plumbing Service' },
            serviceProviderId: { userId: { firstName: 'John', lastName: 'Doe' } }
          },
          customerId: '60d0fe4f5311236168a109ca',
          complaintText: 'Service was not completed properly',
          complaintStatus: 'Pending'
        }
      ];
      
      Complaint.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockComplaints)
      });
      
      await complaintController.getCustomerComplaints(req, res);
      expect(Complaint.find).toHaveBeenCalledWith({ customerId: '60d0fe4f5311236168a109ca' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockComplaints
      });
    });
  });
  
  describe('updateComplaint', () => {
    it('should return 404 if complaint is not found', async () => {
      req.params.id = '60d0fe4f5311236168a109cd';
      req.user.userType = 'admin';
      req.body = { complaintStatus: 'Resolved', resolutionNotes: 'Issue resolved' };
      Complaint.findById.mockResolvedValue(null);
      await complaintController.updateComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Complaint not found'
      });
    });
    
    it('should update complaint status and add resolver info when resolved', async () => {
      req.params.id = '60d0fe4f5311236168a109cd';
      req.user.userType = 'admin';
      req.user.id = '60d0fe4f5311236168a109ce';
      req.body = { complaintStatus: 'Resolved', resolutionNotes: 'Issue resolved' };
      const mockComplaint = {
        _id: '60d0fe4f5311236168a109cd',
        complaintStatus: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      };
      Complaint.findById.mockResolvedValue(mockComplaint);
      await complaintController.updateComplaint(req, res);
      expect(mockComplaint.complaintStatus).toBe('Resolved');
      expect(mockComplaint.resolutionNotes).toBe('Issue resolved');
      expect(mockComplaint.resolvedBy).toBe('60d0fe4f5311236168a109ce');
      expect(mockComplaint.resolvedDateTime).toBeDefined();
      expect(mockComplaint.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockComplaint
      });
    });
    
    it('should update complaint without resolver info when not resolved', async () => {
      req.params.id = '60d0fe4f5311236168a109cd';
      req.user.userType = 'admin';
      req.body = { complaintStatus: 'In Progress', resolutionNotes: 'Working on issue' };
      const mockComplaint = {
        _id: '60d0fe4f5311236168a109cd',
        complaintStatus: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      };
      Complaint.findById.mockResolvedValue(mockComplaint);
      await complaintController.updateComplaint(req, res);
      expect(mockComplaint.complaintStatus).toBe('In Progress');
      expect(mockComplaint.resolutionNotes).toBe('Working on issue');
      expect(mockComplaint.resolvedBy).toBeUndefined();
      expect(mockComplaint.resolvedDateTime).toBeUndefined();
      expect(mockComplaint.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockComplaint
      });
    });
  });
  
  describe('getAllComplaints', () => {
    it('should return all complaints with pagination for admin', async () => {
      req.user.userType = 'admin';
      req.query = { page: '1', limit: '10' };
      const mockComplaints = [
        {
          _id: '60d0fe4f5311236168a109cd',
          customerId: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
          bookingId: { serviceListingId: { serviceTitle: 'Plumbing Service' } },
          complaintStatus: 'Pending',
          complaintText: 'Service was not completed properly'
        }
      ];
      Complaint.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockComplaints)
      });
      Complaint.countDocuments.mockResolvedValue(1);
      await complaintController.getAllComplaints(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: { total: 1, page: 1, pages: 1 },
        data: mockComplaints
      });
    });
  });
});
