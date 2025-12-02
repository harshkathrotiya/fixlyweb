const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AdminEarnings = require('../../models/AdminEarnings');

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
  await AdminEarnings.deleteMany();
});

describe('AdminEarnings Model', () => {
  it('should create a valid AdminEarnings document', async () => {
    const validData = {
      date: new Date('2025-01-01'),
      totalCommissionEarned: 5000,
      totalBookings: 10,
      notes: 'Monthly earnings summary',
    };

    const adminEarnings = new AdminEarnings(validData);
    const saved = await adminEarnings.save();

    expect(saved._id).toBeDefined();
    expect(saved.totalCommissionEarned).toBe(5000);
    expect(saved.totalBookings).toBe(10);
    expect(saved.notes).toBe('Monthly earnings summary');
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
  });

  it('should apply default values when not provided', async () => {
    const adminEarnings = new AdminEarnings({
      date: new Date('2025-01-02'),
    });
    const saved = await adminEarnings.save();

    expect(saved.totalCommissionEarned).toBe(0);
    expect(saved.totalBookings).toBe(0);
  });

  it('should fail validation if required fields are missing', async () => {
    const adminEarnings = new AdminEarnings({});
    let error;
    try {
      await adminEarnings.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.date).toBeDefined();
  });

  it('should not allow duplicate date values', async () => {
    const dateValue = new Date('2025-01-03');
    await AdminEarnings.create({ date: dateValue });
    let error;
    try {
      await AdminEarnings.create({ date: dateValue });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Mongo duplicate key error
  });

  it('should fail if notes exceed 500 characters', async () => {
    const longNote = 'a'.repeat(501);
    const adminEarnings = new AdminEarnings({
      date: new Date('2025-01-04'),
      notes: longNote,
    });
    let error;
    try {
      await adminEarnings.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.notes).toBeDefined();
  });

  it('should store valid ObjectIds in commissions array', async () => {
    const mockId = new mongoose.Types.ObjectId();
    const adminEarnings = new AdminEarnings({
      date: new Date('2025-01-05'),
      commissions: [mockId],
    });
    const saved = await adminEarnings.save();

    expect(saved.commissions.length).toBe(1);
    expect(saved.commissions[0]).toEqual(mockId);
  });
});
