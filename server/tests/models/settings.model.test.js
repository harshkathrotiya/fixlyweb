const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Settings = require('../../models/Settings');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Settings.deleteMany();
});

describe('Settings Model', () => {

  it('should create a settings document with default values', async () => {
    const settings = await Settings.create({});

    expect(settings.general.siteName).toBe('Fixly');
    expect(settings.general.siteDescription).toBe('Service Marketplace Platform');
    expect(settings.general.contactEmail).toBe('support@fixly.com');
    expect(settings.general.contactPhone).toBe('+1234567890');

    expect(settings.commission.rate).toBe(10);
    expect(settings.commission.minimumPayout).toBe(50);
    expect(settings.commission.payoutSchedule).toBe('Monthly');

    expect(settings.notifications.email).toBe(true);
    expect(settings.notifications.sms).toBe(false);
    expect(settings.notifications.push).toBe(true);

    expect(settings.security.requireEmailVerification).toBe(true);
    expect(settings.security.requirePhoneVerification).toBe(false);
    expect(settings.security.requireProviderDocuments).toBe(true);
    expect(settings.security.maintenanceMode).toBe(false);
  });

  it('should enforce enum validation for payoutSchedule', async () => {
    const invalidSettings = new Settings({
      commission: { payoutSchedule: 'Yearly' } // invalid enum
    });

    let error;
    try {
      await invalidSettings.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors['commission.payoutSchedule']).toBeDefined();
  });

  it('should enforce min/max validation for commission rate', async () => {
    const invalidSettings = new Settings({
      commission: { rate: -5 }
    });

    let error;
    try {
      await invalidSettings.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors['commission.rate']).toBeDefined();

    invalidSettings.commission.rate = 150;

    try {
      await invalidSettings.validate();
    } catch (err) {
      error = err;
    }

    expect(error.errors['commission.rate']).toBeDefined();
  });

  it('should return existing settings from getOrCreate', async () => {
    const createdSettings = await Settings.create({});
    const fetchedSettings = await Settings.getOrCreate();

    expect(fetchedSettings._id.toString()).toBe(createdSettings._id.toString());
  });

  it('should create a new settings document if none exists in getOrCreate', async () => {
    const settings = await Settings.getOrCreate();
    expect(settings._id).toBeDefined();
    expect(settings.general.siteName).toBe('Fixly');
  });

});
