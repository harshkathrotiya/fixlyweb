const reportController = require('../../controllers/reportController');
const Report = require('../../models/Report');
const Booking = require('../../models/Booking');
const Payment = require('../../models/Payment');
const Commission = require('../../models/Commission');
const User = require('../../models/Users');
const ServiceProvider = require('../../models/ServiceProvider');
const Complaint = require('../../models/Complaint');

jest.mock('../../models/Report');
jest.mock('../../models/Booking');
jest.mock('../../models/Payment');
jest.mock('../../models/Commission');
jest.mock('../../models/Users');
jest.mock('../../models/ServiceProvider');
jest.mock('../../models/Complaint');

describe('Report Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'admin123', userType: 'admin' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('generateReport', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { reportType: 'Revenue' }; // Missing startDate and endDate

      await reportController.generateReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should return 400 if report type is invalid', async () => {
      req.body = {
        reportType: 'InvalidType',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };

      await reportController.generateReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid report type'
      });
    });

    it('should generate a Revenue report successfully', async () => {
      req.body = {
        reportType: 'Revenue',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        reportSummary: 'Annual Revenue Report'
      };

      const mockPayments = [
        { paymentAmount: 100, commissionAmount: 10, paymentDateTime: new Date('2023-06-15') },
        { paymentAmount: 200, commissionAmount: 20, paymentDateTime: new Date('2023-06-15') }
      ];
      Payment.find.mockResolvedValue(mockPayments);

      const mockReport = {
        _id: 'report123',
        reportType: 'Revenue',
        reportData: { totalRevenue: 300, totalCommission: 30, paymentCount: 2 }
      };
      Report.create.mockResolvedValue(mockReport);

      await reportController.generateReport(req, res);

      expect(Payment.find).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockReport });
    });

    it('should generate a Bookings report successfully', async () => {
      req.body = { reportType: 'Bookings', startDate: '2023-01-01', endDate: '2023-12-31' };

      const mockBookings = [
        { bookingStatus: 'Completed', totalAmount: 100, commissionAmount: 10 },
        { bookingStatus: 'Pending', totalAmount: 0, commissionAmount: 0 }
      ];
      Booking.find.mockResolvedValue(mockBookings);

      const mockReport = {
        _id: 'report123',
        reportType: 'Bookings',
        reportData: {
          totalBookings: 2,
          statusCounts: { Completed: 1, Pending: 1, Confirmed: 0, Cancelled: 0, Rejected: 0 }
        }
      };
      Report.create.mockResolvedValue(mockReport);

      await reportController.generateReport(req, res);

      expect(Booking.find).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockReport });
    });

    it('should generate a Providers report successfully', async () => {
      req.body = { reportType: 'Providers', startDate: '2023-01-01', endDate: '2023-12-31' };

      const mockProviders = [
        { _id: 'provider1', userId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }, rating: 4.5 }
      ];

      const mockBookings = [
        { bookingStatus: 'Completed', totalAmount: 100, commissionAmount: 10 }
      ];

      ServiceProvider.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockProviders) });
      Booking.find.mockResolvedValue(mockBookings);

      const mockReport = {
        _id: 'report123',
        reportType: 'Providers',
        reportData: {
          totalProviders: 1,
          providerStats: [{ providerId: 'provider1', name: 'John Doe', totalBookings: 1 }]
        }
      };
      Report.create.mockResolvedValue(mockReport);

      await reportController.generateReport(req, res);

      expect(ServiceProvider.find).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockReport });
    });
  });

  describe('getAllReports', () => {
    it('should get all reports with pagination', async () => {
      req.query = { page: '1', limit: '10' };

      const mockReports = [
        { _id: 'report1', reportType: 'Revenue' },
        { _id: 'report2', reportType: 'Bookings' }
      ];

      Report.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockReports)
      });

      Report.countDocuments.mockResolvedValue(2);

      await reportController.getAllReports(req, res);

      expect(Report.find).toHaveBeenCalled();
      expect(Report.countDocuments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        pagination: { total: 2, page: 1, pages: 1 },
        data: mockReports
      });
    });

    it('should filter reports by type', async () => {
      req.query = { type: 'Revenue' };

      const mockReports = [{ _id: 'report1', reportType: 'Revenue' }];
      Report.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockReports)
      });
      Report.countDocuments.mockResolvedValue(1);

      await reportController.getAllReports(req, res);

      expect(Report.find).toHaveBeenCalledWith({ reportType: 'Revenue' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data).toEqual(mockReports);
    });

    it('should filter reports by date range', async () => {
      req.query = { from: '2023-01-01', to: '2023-12-31' };

      const mockReports = [{ _id: 'report1', reportType: 'Revenue' }];
      Report.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockReports)
      });
      Report.countDocuments.mockResolvedValue(1);

      await reportController.getAllReports(req, res);

      expect(Report.find).toHaveBeenCalledWith({
        generatedAt: { $gte: expect.any(Date), $lte: expect.any(Date) }
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getReportById', () => {
    it('should return 404 if report not found', async () => {
      req.params.id = 'nonexistent123';
      Report.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await reportController.getReportById(req, res);

      expect(Report.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Report not found' });
    });

    it('should return report details if found', async () => {
      req.params.id = 'report123';
      const mockReport = { _id: 'report123', reportType: 'Revenue', adminId: { firstName: 'Admin', lastName: 'User' } };
      Report.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockReport) });

      await reportController.getReportById(req, res);

      expect(Report.findById).toHaveBeenCalledWith('report123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockReport });
    });
  });

  describe('deleteReport', () => {
    it('should return 404 if report not found', async () => {
      req.params.id = 'nonexistent123';
      Report.findById.mockResolvedValue(null);

      await reportController.deleteReport(req, res);

      expect(Report.findById).toHaveBeenCalledWith('nonexistent123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Report not found' });
    });

    it('should delete report if found', async () => {
      req.params.id = 'report123';
      const mockReport = { _id: 'report123', remove: jest.fn().mockResolvedValue(true) };
      Report.findById.mockResolvedValue(mockReport);

      await reportController.deleteReport(req, res);

      expect(Report.findById).toHaveBeenCalledWith('report123');
      expect(mockReport.remove).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });
  });
});
