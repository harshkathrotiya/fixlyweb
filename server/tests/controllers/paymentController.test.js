const paymentController = require('../../controllers/paymentController');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const Commission = require('../../models/Commission');
const ServiceProvider = require('../../models/ServiceProvider');

jest.mock('../../models/Payment');
jest.mock('../../models/Booking');
jest.mock('../../models/Commission');
jest.mock('../../models/ServiceProvider');

describe('Payment Controller', () => {
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

  describe('createPayment', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { bookingId: 'booking123' }; // Missing paymentMethod

      await paymentController.createPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should return 404 if booking not found', async () => {
      req.body = { bookingId: 'nonexistent123', paymentMethod: 'credit_card', transactionId: 'tx123' };
      Booking.findById.mockResolvedValue(null);

      await paymentController.createPayment(req, res);

      expect(Booking.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking not found'
      });
    });

    it('should return 403 if user is not authorized to make payment', async () => {
      req.body = { bookingId: 'booking123', paymentMethod: 'credit_card', transactionId: 'tx123' };

      const mockBooking = { _id: 'booking123', customerId: 'differentUser456' };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('differentUser456');

      Booking.findById.mockResolvedValue(mockBooking);

      await paymentController.createPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to make payment for this booking'
      });
    });

    it('should return 400 if payment already exists for booking', async () => {
      req.body = { bookingId: 'booking123', paymentMethod: 'credit_card', transactionId: 'tx123' };

      const mockBooking = { _id: 'booking123', customerId: 'user123' };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('user123');

      Booking.findById.mockResolvedValue(mockBooking);
      Payment.findOne.mockResolvedValue({ _id: 'payment123' });

      await paymentController.createPayment(req, res);

      expect(Payment.findOne).toHaveBeenCalledWith({ bookingId: 'booking123' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Payment already exists for this booking'
      });
    });

    it('should create payment successfully', async () => {
      req.body = { bookingId: 'booking123', paymentMethod: 'credit_card', transactionId: 'tx123' };

      const mockBooking = {
        _id: 'booking123',
        customerId: 'user123',
        totalAmount: 100,
        commissionAmount: 10,
        providerEarning: 90,
        serviceProviderId: 'provider123',
        save: jest.fn().mockResolvedValue(true)
      };
      mockBooking.customerId.toString = jest.fn().mockReturnValue('user123');

      const mockPayment = {
        _id: 'payment123',
        bookingId: 'booking123',
        paymentAmount: 100,
        paymentMethod: 'credit_card',
        transactionId: 'tx123',
        commissionAmount: 10,
        providerAmount: 90
      };

      Booking.findById.mockResolvedValue(mockBooking);
      Payment.findOne.mockResolvedValue(null);
      Payment.create.mockResolvedValue(mockPayment);
      Commission.create.mockResolvedValue({ _id: 'commission123' });

      await paymentController.createPayment(req, res);

      expect(Payment.create).toHaveBeenCalledWith({
        bookingId: 'booking123',
        paymentAmount: 100,
        paymentMethod: 'credit_card',
        transactionId: 'tx123',
        commissionAmount: 10,
        providerAmount: 90
      });

      expect(mockBooking.bookingStatus).toBe('Confirmed');
      expect(mockBooking.save).toHaveBeenCalled();

      expect(Commission.create).toHaveBeenCalledWith({
        bookingId: 'booking123',
        serviceProviderId: 'provider123',
        amount: 10,
        rate: 10,
        paymentId: 'payment123',
        status: 'Pending'
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPayment });
    });
  });

  describe('getPaymentById', () => {
    it('should return 404 if payment not found', async () => {
      req.params.id = 'nonexistent123';
      Payment.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await paymentController.getPaymentById(req, res);

      expect(Payment.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Payment not found'
      });
    });

    it('should return payment details if user is authorized', async () => {
      req.params.id = 'payment123';
      req.user = { id: 'user123', userType: 'customer' };

      const mockPayment = {
        _id: 'payment123',
        bookingId: {
          _id: 'booking123',
          customerId: { _id: { toString: () => 'user123' } },
          serviceProviderId: { _id: { toString: () => 'provider123' } }
        }
      };

      Payment.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPayment) });

      await paymentController.getPaymentById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPayment });
    });
  });

  describe('getCustomerPayments', () => {
    it('should return all payments for a customer', async () => {
      const mockPayments = [
        { _id: 'payment1', bookingId: { customerId: 'user123' } },
        { _id: 'payment2', bookingId: { customerId: 'user123' } }
      ];

      Payment.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(mockPayments) });

      await paymentController.getCustomerPayments(req, res);

      expect(Payment.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockPayments
      });
    });
  });
});
