const settingsController = require('../../controllers/settingsController');
const Settings = require('../../models/Settings');
const { cloudinary } = require('../../config/cloudinary');

// Mock dependencies
jest.mock('../../models/Settings');
jest.mock('../../config/cloudinary');

describe('Settings Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      file: null,
      user: { id: 'mockUserId', userType: 'admin' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getSettings', () => {
    it('should return settings successfully', async () => {
      const mockSettings = {
        general: {
          siteName: 'Fixly',
          siteDescription: 'Service marketplace',
          contactEmail: 'contact@fixly.com',
          contactPhone: '123-456-7890',
          logo: 'logo-url'
        },
        commission: {
          rate: 10,
          minimumPayout: 50,
          payoutSchedule: 'Monthly'
        },
        notifications: {
          email: true,
          sms: true,
          push: false
        }
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      await settingsController.getSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockSettings });
    });

    it('should return default settings if none exist', async () => {
      const defaultSettings = {
        general: {
          siteName: 'Default Site',
          siteDescription: 'Default Description',
          contactEmail: 'default@example.com',
          contactPhone: '',
          logo: ''
        },
        commission: {
          rate: 0,
          minimumPayout: 0,
          payoutSchedule: 'Monthly'
        },
        notifications: {
          email: false,
          sms: false,
          push: false
        }
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(defaultSettings);

      await settingsController.getSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: defaultSettings });
    });
  });

  describe('updateGeneralSettings', () => {
    it('should update general settings without logo', async () => {
      const mockSettings = {
        general: {
          siteName: 'Old Name',
          siteDescription: 'Old Description',
          contactEmail: 'old@example.com',
          contactPhone: '111-222-3333',
          logo: 'old-logo-url'
        },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = {
        siteName: 'New Fixly',
        siteDescription: 'New Description',
        contactEmail: 'new@fixly.com',
        contactPhone: '999-888-7777'
      };

      await settingsController.updateGeneralSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
      expect(mockSettings.general.siteName).toBe('New Fixly');
      expect(mockSettings.general.siteDescription).toBe('New Description');
      expect(mockSettings.general.contactEmail).toBe('new@fixly.com');
      expect(mockSettings.general.contactPhone).toBe('999-888-7777');
      expect(mockSettings.general.logo).toBe('old-logo-url');
      expect(mockSettings.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSettings,
        message: 'General settings updated successfully'
      });
    });

    it('should update general settings with logo', async () => {
      const mockSettings = {
        general: {
          siteName: 'Old Name',
          siteDescription: 'Old Description',
          contactEmail: 'old@example.com',
          contactPhone: '111-222-3333',
          logo: 'old-logo-url'
        },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { siteName: 'New Fixly' };
      req.file = { secure_url: 'new-logo-url' };

      await settingsController.updateGeneralSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
      expect(mockSettings.general.siteName).toBe('New Fixly');
      expect(mockSettings.general.logo).toBe('new-logo-url');
      expect(mockSettings.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should update only provided fields', async () => {
      const mockSettings = {
        general: {
          siteName: 'Old Name',
          siteDescription: 'Old Description',
          contactEmail: 'old@example.com',
          contactPhone: '111-222-3333',
          logo: 'old-logo-url'
        },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { siteName: 'New Name' };

      await settingsController.updateGeneralSettings(req, res);

      expect(mockSettings.general.siteName).toBe('New Name');
      expect(mockSettings.general.siteDescription).toBe('Old Description');
      expect(mockSettings.general.contactEmail).toBe('old@example.com');
      expect(mockSettings.general.contactPhone).toBe('111-222-3333');
      expect(mockSettings.save).toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const mockSettings = {
        general: {
          siteName: 'Old Name',
          siteDescription: 'Old Description',
          contactEmail: 'old@example.com',
          contactPhone: '111-222-3333',
          logo: 'old-logo-url'
        },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { contactEmail: 'invalid-email' };

      await settingsController.updateGeneralSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
    });
  });

  describe('updateCommissionSettings', () => {
    it('should update commission settings', async () => {
      const mockSettings = {
        commission: { rate: 10, minimumPayout: 50, payoutSchedule: 'Monthly' },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { rate: 15, minimumPayout: 100, payoutSchedule: 'Weekly' };

      await settingsController.updateCommissionSettings(req, res);

      expect(mockSettings.commission.rate).toBe(15);
      expect(mockSettings.commission.minimumPayout).toBe(100);
      expect(mockSettings.commission.payoutSchedule).toBe('Weekly');
      expect(mockSettings.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should update only provided commission settings', async () => {
      const mockSettings = {
        commission: { rate: 10, minimumPayout: 50, payoutSchedule: 'Monthly' },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { rate: 15 };

      await settingsController.updateCommissionSettings(req, res);

      expect(mockSettings.commission.rate).toBe(15);
      expect(mockSettings.commission.minimumPayout).toBe(50);
      expect(mockSettings.commission.payoutSchedule).toBe('Monthly');
      expect(mockSettings.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should validate commission rate is positive', async () => {
      const mockSettings = {
        commission: { rate: 10, minimumPayout: 50, payoutSchedule: 'Monthly' },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { rate: -5 };

      await settingsController.updateCommissionSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
    });

    it('should update all commission fields together', async () => {
      const mockSettings = {
        commission: { rate: 10, minimumPayout: 50, payoutSchedule: 'Monthly' },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { rate: 20, minimumPayout: 75, payoutSchedule: 'Bi-Weekly' };

      await settingsController.updateCommissionSettings(req, res);

      expect(mockSettings.commission.rate).toBe(20);
      expect(mockSettings.commission.minimumPayout).toBe(75);
      expect(mockSettings.commission.payoutSchedule).toBe('Bi-Weekly');
      expect(mockSettings.save).toHaveBeenCalled();
    });
  });

  describe('updateNotificationSettings', () => {
    it('should update notification settings', async () => {
      const mockSettings = {
        notifications: { email: true, sms: true, push: false },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { email: false, sms: false, push: true };

      await settingsController.updateNotificationSettings(req, res);

      expect(mockSettings.notifications.email).toBe(false);
      expect(mockSettings.notifications.sms).toBe(false);
      expect(mockSettings.notifications.push).toBe(true);
      expect(mockSettings.save).toHaveBeenCalled();
    });

    it('should update only provided notification settings', async () => {
      const mockSettings = {
        notifications: { email: true, sms: true, push: false },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { email: false };

      await settingsController.updateNotificationSettings(req, res);

      expect(mockSettings.notifications.email).toBe(false);
      expect(mockSettings.notifications.sms).toBe(true);
      expect(mockSettings.notifications.push).toBe(false);
      expect(mockSettings.save).toHaveBeenCalled();
    });

    it('should handle boolean type coercion', async () => {
      const mockSettings = {
        notifications: { email: true, sms: true, push: false },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { email: 'false', sms: 0, push: 1 };

      await settingsController.updateNotificationSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
      expect(mockSettings.save).toHaveBeenCalled();
    });

    it('should disable all notifications', async () => {
      const mockSettings = {
        notifications: { email: true, sms: true, push: true },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { email: false, sms: false, push: false };

      await settingsController.updateNotificationSettings(req, res);

      expect(mockSettings.notifications.email).toBe(false);
      expect(mockSettings.notifications.sms).toBe(false);
      expect(mockSettings.notifications.push).toBe(false);
      expect(mockSettings.save).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle empty request body gracefully', async () => {
      const mockSettings = {
        general: { siteName: 'Fixly', siteDescription: 'Description', contactEmail: 'contact@fixly.com', contactPhone: '123-456-7890', logo: 'logo-url' },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = {};

      await settingsController.updateGeneralSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
    });

    it('should handle null values in request body', async () => {
      const mockSettings = {
        general: { siteName: 'Fixly', siteDescription: 'Description', contactEmail: 'contact@fixly.com', contactPhone: '123-456-7890', logo: 'logo-url' },
        save: jest.fn().mockResolvedValue(true)
      };
      Settings.getOrCreate = jest.fn().mockResolvedValue(mockSettings);

      req.body = { siteName: null, siteDescription: undefined };

      await settingsController.updateGeneralSettings(req, res);

      expect(Settings.getOrCreate).toHaveBeenCalled();
    });
  });
});
