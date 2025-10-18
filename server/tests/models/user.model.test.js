const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

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
  await User.deleteMany();
});

describe('User Model', () => {

  it('should create a user with required fields', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password: 'password123'
    };

    const user = await User.create(userData);

    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.phone).toBe('1234567890');
    expect(user.userType).toBe('user');
    expect(user.profilePicture).toBe('default-profile.jpg');
    expect(user.isActive).toBe(true);
    expect(user.address).toEqual({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
  });

  it('should hash the password before saving', async () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '0987654321',
      password: 'mypassword'
    };

    const user = await User.create(userData);

    expect(user.password).not.toBe('mypassword');
    const isMatch = await bcrypt.compare('mypassword', user.password);
    expect(isMatch).toBe(true);
  });

  it('should generate a valid JWT token', async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRE = '1h';

    const user = await User.create({
      firstName: 'Token',
      lastName: 'User',
      email: 'token@example.com',
      phone: '1112223333',
      password: 'password123'
    });

    const token = user.getSignedJwtToken();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id.toString()).toBe(user._id.toString());
  });

  it('should match entered password correctly', async () => {
    const user = await User.create({
      firstName: 'Pass',
      lastName: 'Test',
      email: 'pass@example.com',
      phone: '4445556666',
      password: 'secret123'
    });

    const match = await user.matchPassword('secret123');
    const wrong = await user.matchPassword('wrongpassword');

    expect(match).toBe(true);
    expect(wrong).toBe(false);
  });

  it('should update resetPasswordToken and resetPasswordExpire', async () => {
    const user = await User.create({
      firstName: 'Reset',
      lastName: 'User',
      email: 'reset@example.com',
      phone: '7778889999',
      password: 'password123'
    });

    const resetToken = user.getResetPasswordToken();
    await user.save();

    expect(resetToken).toBeDefined();
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();
    
    // Check that resetPasswordExpire is in the future
    expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
  });

});
