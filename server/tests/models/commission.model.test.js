const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Commission = require('../../models/Commission'); 
const Booking = require('../../models/Booking'); // referenced model
const ServiceProvider = require('../../models/ServiceProvider');

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
  await Commission.deleteMany();
  await Booking.deleteMany();
  await ServiceProvider.deleteMany();
});

describe('Commission Model', () => {
  it('should create a valid Commission document', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test Service'
    });

    const booking = await Booking.create({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date(),
      totalAmount: 1000
    });

    const commissionData = {
      bookingId: booking._id,
      serviceProviderId: provider._id,
      amount: 100,
      rate: 10
    };

    const commission = await Commission.create(commissionData);

    expect(commission._id).toBeDefined();
    expect(commission.status).toBe('Pending'); // default
    expect(commission.amount).toBe(100);
    expect(commission.rate).toBe(10);
  });

  it('should fail validation if required fields are missing', async () => {
    const commission = new Commission({});
    let error;
    try {
      await commission.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.bookingId).toBeDefined();
    expect(error.errors.serviceProviderId).toBeDefined();
    expect(error.errors.amount).toBeDefined();
    expect(error.errors.rate).toBeDefined();
  });

  it('should fail if amount is negative', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test Service'
    });

    const booking = await Booking.create({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date(),
      totalAmount: 1000
    });

    const commission = new Commission({
      bookingId: booking._id,
      serviceProviderId: provider._id,
      amount: -50,
      rate: 10
    });

    let error;
    try {
      await commission.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.amount).toBeDefined();
  });

  it('should fail if rate is negative or more than 100', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test Service'
    });

    const booking = await Booking.create({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date(),
      totalAmount: 1000
    });

    const commission1 = new Commission({
      bookingId: booking._id,
      serviceProviderId: provider._id,
      amount: 100,
      rate: -10
    });

    const commission2 = new Commission({
      bookingId: booking._id,
      serviceProviderId: provider._id,
      amount: 100,
      rate: 150
    });

    let error1, error2;
    try {
      await commission1.validate();
    } catch (err) {
      error1 = err;
    }

    try {
      await commission2.validate();
    } catch (err) {
      error2 = err;
    }

    expect(error1).toBeDefined();
    expect(error1.errors.rate).toBeDefined();

    expect(error2).toBeDefined();
    expect(error2.errors.rate).toBeDefined();
  });

  it('should allow optional fields like paymentId and collectionDate', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test Service'
    });

    const booking = await Booking.create({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date(),
      totalAmount: 1000
    });

    const commission = await Commission.create({
      bookingId: booking._id,
      serviceProviderId: provider._id,
      amount: 100,
      rate: 10,
      collectionDate: new Date(),
      paymentId: new mongoose.Types.ObjectId()
    });

    expect(commission.collectionDate).toBeDefined();
    expect(commission.paymentId).toBeDefined();
  });
});
