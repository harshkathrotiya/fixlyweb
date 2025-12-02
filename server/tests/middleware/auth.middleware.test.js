const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');

const User = require('../../models/Users'); 
const { protect, authorize } = require('../../middleware/auth'); 

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Set JWT_SECRET for all tests
  process.env.JWT_SECRET = 'testsecret';

  // Create express app for testing
  app = express();

  app.get('/protected', protect, (req, res) => {
    res.status(200).json({ success: true, user: req.user._id });
  });

  app.get('/admin-only', protect, authorize('admin'), (req, res) => {
    res.status(200).json({ success: true });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('Auth Middleware', () => {

  it('should allow access if valid token is provided', async () => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password: 'password123'
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBe(user._id.toString());
  });

  it('should deny access if token is invalid', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Not authorized to access this route');
  });

  it('should deny access if user is inactive', async () => {
    const user = await User.create({
      firstName: 'Inactive',
      lastName: 'User',
      email: 'inactive@example.com',
      phone: '1112223333',
      password: 'password123',
      isActive: false
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Your account has been deactivated. Please contact support.');
  });

  it('should deny access if user does not have required role', async () => {
    const user = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'regular@example.com',
      phone: '4445556666',
      password: 'password123',
      userType: 'user'
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User role user is not authorized to access this route');
  });

  it('should allow access if user has required role', async () => {
    const user = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '7778889999',
      password: 'password123',
      userType: 'admin'
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});
