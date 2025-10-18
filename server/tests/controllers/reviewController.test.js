const reviewController = require('../../controllers/reviewController');
const Review = require('../../models/Review');
const Booking = require('../../models/Booking');
const ServiceListing = require('../../models/ServiceListing');
const ServiceProvider = require('../../models/ServiceProvider');

// Mock dependencies
jest.mock('../../models/Review');
jest.mock('../../models/Booking');
jest.mock('../../models/ServiceListing');
jest.mock('../../models/ServiceProvider');

describe('Review Controller', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      params: {},
      user: { 
        id: 'user123',
        userType: 'customer'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createReview', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { bookingId: 'booking123' };
      await reviewController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should return 404 if booking not found', async () => {
      req.body = { bookingId: 'nonexistent123', rating: 4, reviewText: 'Great service!' };
      Booking.findById.mockResolvedValue(null);
      await reviewController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Booking not found' });
    });

    it('should return 403 if user is not authorized to review the booking', async () => {
      req.body = { bookingId: 'booking123', rating: 4, reviewText: 'Great service!' };
      const mockBooking = { _id: 'booking123', customerId: 'differentUser456' };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('differentUser456');
      Booking.findById.mockResolvedValue(mockBooking);
      await reviewController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authorized to review this booking' });
    });

    it('should return 400 if booking is not completed', async () => {
      req.body = { bookingId: 'booking123', rating: 4, reviewText: 'Great service!' };
      const mockBooking = { _id: 'booking123', customerId: 'user123', bookingStatus: 'Pending' };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('user123');
      Booking.findById.mockResolvedValue(mockBooking);
      await reviewController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot review a booking that is not completed' });
    });

    it('should return 400 if review already exists for the booking', async () => {
      req.body = { bookingId: 'booking123', rating: 4, reviewText: 'Great service!' };
      const mockBooking = { _id: 'booking123', customerId: 'user123', bookingStatus: 'Completed' };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('user123');
      Booking.findById.mockResolvedValue(mockBooking);
      Review.findOne.mockResolvedValue({ _id: 'review123' });
      await reviewController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Review already exists for this booking' });
    });

    it('should create review successfully', async () => {
      req.body = { bookingId: 'booking123', rating: 4, reviewText: 'Great service!' };
      const mockBooking = { _id: 'booking123', customerId: 'user123', bookingStatus: 'Completed' };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('user123');
      const mockReview = { _id: 'review123', bookingId: 'booking123', customerId: 'user123', rating: 4, reviewText: 'Great service!' };
      Booking.findById.mockResolvedValue(mockBooking);
      Review.findOne.mockResolvedValue(null);
      Review.create.mockResolvedValue(mockReview);
      await reviewController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockReview });
    });
  });

  describe('getProviderReviews', () => {
    it('should return reviews for a service provider', async () => {
      req.params.providerId = 'provider123';
      const mockBookings = [{ _id: 'booking1' }, { _id: 'booking2' }];
      const mockReviews = [{ _id: 'review1', bookingId: 'booking1' }, { _id: 'review2', bookingId: 'booking2' }];
      Booking.find.mockResolvedValue(mockBookings);
      Review.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockReviews)
      });
      await reviewController.getProviderReviews(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: mockReviews });
    });
  });

  describe('getListingReviews', () => {
    it('should return reviews for a service listing', async () => {
      req.params.listingId = 'listing123';
      const mockBookings = [{ _id: 'booking1' }, { _id: 'booking2' }];
      const mockReviews = [{ _id: 'review1', bookingId: 'booking1' }, { _id: 'review2', bookingId: 'booking2' }];
      Booking.find.mockResolvedValue(mockBookings);
      Review.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockReviews)
      });
      await reviewController.getListingReviews(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: mockReviews });
    });
  });

  describe('updateReview', () => {
    it('should return 404 if review not found', async () => {
      req.params.id = 'nonexistent123';
      req.body = { rating: 5, reviewText: 'Updated review text' };
      Review.findById.mockResolvedValue(null);
      await reviewController.updateReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Review not found' });
    });

    it('should return 403 if user is not authorized to update the review', async () => {
      req.params.id = 'review123';
      req.body = { rating: 5, reviewText: 'Updated review text' };
      const mockReview = { _id: 'review123', customerId: 'differentUser456' };
      mockReview.customerId.toString = jest.fn().mockReturnValue('differentUser456');
      Review.findById.mockResolvedValue(mockReview);
      await reviewController.updateReview(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authorized to update this review' });
    });

    it('should update review successfully', async () => {
      req.params.id = 'review123';
      req.body = { rating: 5, reviewText: 'Updated review text' };
      const mockReview = { _id: 'review123', customerId: 'user123', rating: 4, reviewText: 'Original review text', save: jest.fn().mockResolvedValue(true) };
      mockReview.customerId.toString = jest.fn().mockReturnValue('user123');
      Review.findById.mockResolvedValue(mockReview);
      await reviewController.updateReview(req, res);
      expect(mockReview.rating).toBe(5);
      expect(mockReview.reviewText).toBe('Updated review text');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockReview });
    });
  });

  describe('deleteReview', () => {
    it('should return 404 if review not found', async () => {
      req.params.id = 'nonexistent123';
      Review.findById.mockResolvedValue(null);
      await reviewController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Review not found' });
    });

    it('should return 403 if user is not authorized to delete the review', async () => {
      req.params.id = 'review123';
      const mockReview = { _id: 'review123', customerId: 'differentUser456' };
      mockReview.customerId.toString = jest.fn().mockReturnValue('differentUser456');
      Review.findById.mockResolvedValue(mockReview);
      await reviewController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authorized to delete this review' });
    });

    it('should delete review successfully', async () => {
      req.params.id = 'review123';
      const mockReview = { _id: 'review123', customerId: 'user123', remove: jest.fn().mockResolvedValue(true) };
      mockReview.customerId.toString = jest.fn().mockReturnValue('user123');
      Review.findById.mockResolvedValue(mockReview);
      await reviewController.deleteReview(req, res);
      expect(mockReview.remove).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });
  });
});
