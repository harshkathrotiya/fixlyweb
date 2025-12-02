const specificReportController = require('../../controllers/specificReportController');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const User = require('../../models/Users');
const ServiceProvider = require('../../models/ServiceProvider');
const ServiceCategory = require('../../models/ServiceCategory');
const ServiceListing = require('../../models/ServiceListing');

// Mock dependencies
jest.mock('../../models/Payment');
jest.mock('../../models/Booking');
jest.mock('../../models/Users');
jest.mock('../../models/ServiceProvider');
jest.mock('../../models/ServiceCategory');
jest.mock('../../models/ServiceListing');

describe('Specific Report Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'mockUserId', userType: 'admin' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getRevenueReport', () => {
    const missingParamsMessage = {
      success: false,
      message: 'Please provide timeFrame, startDate, and endDate parameters',
    };

    it('should return 400 if required parameters are missing', async () => {
      await specificReportController.getRevenueReport(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(missingParamsMessage);
    });

    it('should return 400 if timeFrame is missing', async () => {
      req.query = { startDate: '2023-01-01', endDate: '2023-01-03' };
      await specificReportController.getRevenueReport(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(missingParamsMessage);
    });

    it('should return 400 if startDate is missing', async () => {
      req.query = { timeFrame: 'daily', endDate: '2023-01-03' };
      await specificReportController.getRevenueReport(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(missingParamsMessage);
    });

    it('should return 400 if endDate is missing', async () => {
      req.query = { timeFrame: 'daily', startDate: '2023-01-01' };
      await specificReportController.getRevenueReport(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(missingParamsMessage);
    });

    it('should return revenue report data with daily timeframe', async () => {
      req.query = { timeFrame: 'daily', startDate: '2023-01-01', endDate: '2023-01-03' };

      const mockPayments = [
        { paymentDateTime: new Date('2023-01-01T12:00:00Z'), paymentAmount: 100, commissionAmount: 10, paymentStatus: 'Completed' },
        { paymentDateTime: new Date('2023-01-02T15:00:00Z'), paymentAmount: 200, commissionAmount: 20, paymentStatus: 'Completed' },
        { paymentDateTime: new Date('2023-01-03T10:00:00Z'), paymentAmount: 150, commissionAmount: 15, paymentStatus: 'Completed' },
      ];

      Payment.find.mockResolvedValue(mockPayments);

      await specificReportController.getRevenueReport(req, res);

      expect(Payment.find).toHaveBeenCalledWith({
        paymentDateTime: { $gte: expect.any(Date), $lte: expect.any(Date) },
        paymentStatus: 'Completed',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.labels).toBeDefined();
      expect(responseData.data.datasets).toHaveLength(2); // Revenue and Commission
      expect(responseData.data.summary.totalRevenue).toBe(450); // 100 + 200 + 150
      expect(responseData.data.summary.totalCommission).toBe(45); // 10 + 20 + 15
      expect(responseData.data.summary.totalPayments).toBe(3);
      expect(responseData.data.summary.averageRevenue).toBe(150); // 450 / 3
    });

    it('should handle empty payment data', async () => {
      req.query = { timeFrame: 'daily', startDate: '2023-01-01', endDate: '2023-01-03' };
      Payment.find.mockResolvedValue([]);
      await specificReportController.getRevenueReport(req, res);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.summary.totalRevenue).toBe(0);
      expect(responseData.data.summary.totalCommission).toBe(0);
      expect(responseData.data.summary.totalPayments).toBe(0);
      expect(responseData.data.summary.averageRevenue).toBe(0);
    });
  });

  describe('Additional Report Functions', () => {
    it('should be tested as they are implemented', () => {
      expect(true).toBe(true);
    });
  });
});
