const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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
  await ServiceCategory.deleteMany();
});

describe('ServiceCategory Model', () => {
  it('should create a valid ServiceCategory document', async () => {
    const categoryData = {
      categoryName: 'Plumbing',
      categoryDescription: 'All plumbing related services'
    };

    const category = await ServiceCategory.create(categoryData);

    expect(category._id).toBeDefined();
    expect(category.categoryName).toBe('Plumbing');
    expect(category.categoryDescription).toBe('All plumbing related services');
    expect(category.categoryImage).toBe('');
    expect(category.isActive).toBe(true);
    expect(category.parentCategory).toBeNull();
  });

  it('should fail validation if required fields are missing', async () => {
    const category = new ServiceCategory({});
    let error;
    try {
      await category.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.categoryName).toBeDefined();
    expect(error.errors.categoryDescription).toBeDefined();
  });

  it('should enforce max length for categoryName and categoryDescription', async () => {
    const category = new ServiceCategory({
      categoryName: 'a'.repeat(51), // exceed max
      categoryDescription: 'b'.repeat(501) // exceed max
    });

    let error;
    try {
      await category.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.categoryName).toBeDefined();
    expect(error.errors.categoryDescription).toBeDefined();
  });

  it('should enforce unique categoryName', async () => {
    const categoryData = {
      categoryName: 'Electrical',
      categoryDescription: 'Electrical services'
    };

    await ServiceCategory.create(categoryData);

    let error;
    try {
      await ServiceCategory.create(categoryData); // duplicate
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
  });
});
