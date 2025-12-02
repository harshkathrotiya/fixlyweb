const authController = require('../../controllers/authController');
const User = require('../../models/Users');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');

// Mock dependencies
jest.mock('../../models/Users');
jest.mock('../../utils/sendEmail');
jest.mock('crypto');

describe('Auth Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      body: {},
      params: {},
      user: { id: 'user123' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      // Arrange
      req.body = {
        userType: 'user',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St'
      };
      
      const mockUser = {
        _id: 'user123',
        ...req.body,
        getSignedJwtToken: jest.fn().mockReturnValue('mockedtoken')
      };
      
      User.create.mockResolvedValue(mockUser);
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockedtoken'
      });
    });

    it('should handle server error during registration', async () => {
      // Arrange
      req.body = {
        userType: 'user',
        username: 'testuser',
        email: 'test@example.com'
      };
      
      User.create.mockRejectedValue(new Error('Database error'));
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        sucess: false,
        message: 'Server error'
      });
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      // Arrange
      req.body = { email: 'test@example.com' }; // Missing password
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide an email and password'
      });
    });

    it('should return 401 if user not found', async () => {
      // Arrange
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should login user successfully and return token', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('mockedtoken')
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockedtoken'
      });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success', async () => {
      // Act
      await authController.logout(req, res);
      
      // Assert
      expect(res.cookie).toHaveBeenCalledWith('token', 'none', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      };
      
      User.findById.mockResolvedValue(mockUser);
      
      // Act
      await authController.getMe(req, res);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
  });

  describe('updateDetails', () => {
    it('should update user details successfully', async () => {
      // Arrange
      req.body = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        phone: '9876543210',
        address: '456 New St'
      };
      
      const mockUpdatedUser = {
        _id: 'user123',
        ...req.body
      };
      
      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);
      
      // Act
      await authController.updateDetails(req, res);
      
      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedUser
      });
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and send email', async () => {
      // Arrange
      req.body = { email: 'test@example.com' };
      
      const mockUser = {
        email: 'test@example.com',
        getResetPasswordToken: jest.fn().mockReturnValue('resettoken123'),
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue(true);
      
      // Act
      await authController.forgotPassword(req, res);
      
      // Assert
      expect(mockUser.getResetPasswordToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: 'Email sent'
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      req.params.resettoken = 'validtoken';
      req.body.password = 'newpassword123';
      
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedtoken')
      });
      
      const mockUser = {
        password: 'oldpassword',
        resetPasswordToken: 'hashedtoken',
        resetPasswordExpire: Date.now() + 10000,
        save: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('mockedtoken')
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await authController.resetPassword(req, res);
      
      // Assert
      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpire).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockedtoken'
      });
    });
  });
});