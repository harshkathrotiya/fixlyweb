const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceListing = require('../../models/ServiceListing'); 
const ServiceProvider = require('../../models/ServiceProvider'); 
const ServiceCategory = require('../../models/ServiceCategory'); 

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
  await ServiceListing.deleteMany();
  await ServiceProvider.deleteMany();
  await ServiceCategory.deleteMany();
});

describe('ServiceListing Model', () => {
  let provider;
  let category;

  beforeEach(async () => {
    provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test provider service'
    });

    category = await ServiceCategory.create({
      categoryName: 'Test Category',
      categoryDescription: 'Test category description'
    });
  });

  it('should create a valid ServiceListing document', async () => {
    const listingData = {
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'Test Service',
      servicePrice: 100,
      serviceDetails: 'Service details here',
      serviceImage: 'image.jpg',
      tags: ['tag1', 'tag2']
    };

    const listing = await ServiceListing.create(listingData);

    expect(listing._id).toBeDefined();
    expect(listing.serviceTitle).toBe('Test Service');
    expect(listing.servicePrice).toBe(100);
    expect(listing.serviceDetails).toBe('Service details here');
    expect(listing.serviceImage).toBe('image.jpg');
    expect(listing.isActive).toBe(true);
    expect(listing.commissionAmount).toBe(10); // default 10% commission
    expect(listing.providerEarning).toBe(90);
    expect(listing.duration).toBe(0);
    expect(listing.serviceLocation).toBe('');
    expect(listing.averageRating).toBe(0);
    expect(listing.reviewCount).toBe(0);
    expect(listing.bookingCount).toBe(0);
  });

  it('should fail validation if required fields are missing', async () => {
    const listing = new ServiceListing({});
    let error;

    try {
      await listing.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.serviceProviderId).toBeDefined();
    expect(error.errors.categoryId).toBeDefined();
    expect(error.errors.serviceTitle).toBeDefined();
    expect(error.errors.servicePrice).toBeDefined();
    expect(error.errors.serviceDetails).toBeDefined();
  });

  it('should enforce max length for serviceTitle and serviceDetails', async () => {
    const listing = new ServiceListing({
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'a'.repeat(101),
      servicePrice: 100,
      serviceDetails: 'b'.repeat(1001)
    });

    let error;
    try {
      await listing.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.serviceTitle).toBeDefined();
    expect(error.errors.serviceDetails).toBeDefined();
  });

  it('should set default serviceImage if null or undefined', async () => {
    const listing = await ServiceListing.create({
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'Test Service',
      servicePrice: 100,
      serviceDetails: 'Service details here',
      serviceImage: null
    });

    expect(listing.serviceImage).toBe('');
  });

  it('should calculate commission and providerEarning correctly', async () => {
    const listing = await ServiceListing.create({
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'Test Service',
      servicePrice: 200,
      serviceDetails: 'Service details here'
    });

    expect(listing.commissionAmount).toBe(20); // 10% of 200
    expect(listing.providerEarning).toBe(180);
  });
});
