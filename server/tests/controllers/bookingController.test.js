const bookingController = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');
const ServiceListing = require('../../models/ServiceListing');
const ServiceProvider = require('../../models/ServiceProvider');
const User = require('../../models/Users');

// Mock dependencies
jest.mock('../../models/Booking');
jest.mock('../../models/ServiceListing');
jest.mock('../../models/ServiceProvider');
jest.mock('../../models/Users');

describe('Booking Controller', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      params: {},
      user: { id: 'user123', userType: 'customer' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // ---------- createBooking ----------
  describe('createBooking', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { serviceListingId: 'service123' };
      await bookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should return 404 if service listing not found', async () => {
      req.body = { serviceListingId: 'nonexistent123', serviceDateTime: '2023-06-15T10:00:00Z' };
      ServiceListing.findById.mockResolvedValue(null);
      await bookingController.createBooking(req, res);
      expect(ServiceListing.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service listing not found'
      });
    });

    it('should return 400 if service listing is inactive', async () => {
      req.body = { serviceListingId: 'service123', serviceDateTime: '2023-06-15T10:00:00Z' };
      ServiceListing.findById.mockResolvedValue({ _id: 'service123', serviceProviderId: 'provider123', servicePrice: 100, isActive: false });
      await bookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'This service is currently unavailable'
      });
    });

    it('should create a booking successfully', async () => {
      req.body = { serviceListingId: 'service123', serviceDateTime: '2023-06-15T10:00:00Z', specialInstructions: 'Please arrive on time' };
      ServiceListing.findById.mockResolvedValue({ _id: 'service123', serviceProviderId: 'provider123', servicePrice: 100, isActive: true });
      const mockBooking = { _id: 'booking123', customerId: 'user123', serviceProviderId: 'provider123', serviceListingId: 'service123', serviceDateTime: new Date('2023-06-15T10:00:00Z'), specialInstructions: 'Please arrive on time', totalAmount: 100 };
      Booking.create.mockResolvedValue(mockBooking);
      await bookingController.createBooking(req, res);
      expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({
        customerId: 'user123',
        serviceProviderId: 'provider123',
        serviceListingId: 'service123',
        totalAmount: 100
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockBooking });
    });
  });

  // ---------- getCustomerBookings ----------
  describe('getCustomerBookings', () => {
    it('should return all bookings for a customer', async () => {
      const mockBookings = [{ _id: 'booking1', customerId: 'user123' }, { _id: 'booking2', customerId: 'user123' }];
      Booking.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(mockBookings) });
      await bookingController.getCustomerBookings(req, res);
      expect(Booking.find).toHaveBeenCalledWith({ customerId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: mockBookings });
    });
  });

  // ---------- getProviderBookings ----------
  describe('getProviderBookings', () => {
    it('should return 404 if service provider profile not found', async () => {
      req.user.userType = 'service_provider';
      ServiceProvider.findOne.mockResolvedValue(null);
      await bookingController.getProviderBookings(req, res);
      expect(ServiceProvider.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Service provider profile not found' });
    });

    it('should return all bookings for a service provider', async () => {
      req.user.userType = 'service_provider';
      ServiceProvider.findOne.mockResolvedValue({ _id: 'provider123', userId: 'user123' });
      const mockBookings = [{ _id: 'booking1', serviceProviderId: 'provider123' }, { _id: 'booking2', serviceProviderId: 'provider123' }];
      Booking.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(mockBookings) });
      await bookingController.getProviderBookings(req, res);
      expect(Booking.find).toHaveBeenCalledWith({ serviceProviderId: 'provider123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: mockBookings });
    });
  });

  // ---------- updateBookingStatus ----------
  describe('updateBookingStatus', () => {
    it('should return 400 if status is not provided', async () => {
      req.params.id = 'booking123';
      req.body = {};
      await bookingController.updateBookingStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Please provide a status' });
    });

    it('should return 404 if booking not found', async () => {
      req.params.id = 'nonexistent123';
      req.body = { status: 'completed' };
      Booking.findById.mockResolvedValue(null);
      await bookingController.updateBookingStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Booking not found' });
    });
  });
});
